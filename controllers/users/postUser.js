const {
	INTERNAL_SERVER_ERROR_CODE,
	INTERNAL_SERVER_ERROR,
	INVALID_REQUEST_DATA_CODE,
	INVALID_REQUEST_DATA,
	EMAIL_DOMAIN_NOT_ALLOWED,
	EMAIL_DOMAIN_NOT_ALLOWED_CODE,
	EMAIL_ALREADY_REGISTERED,
	EMAIL_ALREADY_REGISTERED_CODE,
} = require("../../constants/constants");
const { logger } = require("../../debugger/logger");
const userModel = require("../../models/user.model");
const emailVerificationModel = require("../../models/emailVerification.model");
const bcrypt = require("bcryptjs");
const { isAllowedEmailDomain } = require("../../lib/emailAllowlist");
const { generateVerificationCode, CODE_TTL_MS } = require("../../lib/verificationCode");
const { sendVerificationEmail } = require("../../lib/mailer");

const postUser = async (req, res) => {
	if (!req.body.password) {
		return res.status(INVALID_REQUEST_DATA_CODE).json({
			success: false,
			msg: INVALID_REQUEST_DATA,
		});
	}

	if (!isAllowedEmailDomain(req.body.email)) {
		return res.status(EMAIL_DOMAIN_NOT_ALLOWED_CODE).json({
			success: false,
			msg: EMAIL_DOMAIN_NOT_ALLOWED,
		});
	}

	try {
		const {
			firstName,
			middleName,
			lastName,
			dateOfBirth,
			email,
			phoneNumber,
			address,
			social,
			graduationYear,
		} = req.body;

		const hashedPassword = await bcrypt.hash(req.body.password, 12);
		const newUser = userModel({
			firstName,
			middleName,
			lastName,
			dateOfBirth,
			email,
			phoneNumber,
			address,
			social,
			graduationYear,
			password: hashedPassword,
		});

		const savedUser = await newUser.save();

		const code = generateVerificationCode();
		const codeHash = await bcrypt.hash(code, 12);
		await emailVerificationModel.create({
			user: savedUser._id,
			codeHash,
			expiresAt: new Date(Date.now() + CODE_TTL_MS),
		});
		await sendVerificationEmail(savedUser.email, code);

		const { password, ...userWithoutPassword } = savedUser.toObject();
		return res.json({ success: true, data: userWithoutPassword });
	} catch (err) {
		if (err.code === 11000) {
			return res.status(EMAIL_ALREADY_REGISTERED_CODE).json({
				success: false,
				msg: EMAIL_ALREADY_REGISTERED,
			});
		}

		logger("error", __filename, "", err);
		return res
			.status(INTERNAL_SERVER_ERROR_CODE)
			.json({ success: false, msg: INTERNAL_SERVER_ERROR });
	}
};

module.exports = { postUser };
