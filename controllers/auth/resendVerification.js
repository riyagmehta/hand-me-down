const bcrypt = require("bcryptjs");
const {
	INVALID_REQUEST_DATA,
	INVALID_REQUEST_DATA_CODE,
	INTERNAL_SERVER_ERROR,
	INTERNAL_SERVER_ERROR_CODE,
} = require("../../constants/constants");
const { logger } = require("../../debugger/logger");
const userModel = require("../../models/user.model");
const emailVerificationModel = require("../../models/emailVerification.model");
const { generateVerificationCode, CODE_TTL_MS } = require("../../lib/verificationCode");
const { sendVerificationEmail } = require("../../lib/mailer");

const resendVerification = async (req, res) => {
	const { email } = req.body;

	if (!email) {
		return res.status(INVALID_REQUEST_DATA_CODE).json({
			success: false,
			msg: INVALID_REQUEST_DATA,
		});
	}

	try {
		const user = await userModel.findOne({ email });

		// Same response whether the account exists, is already verified, or
		// genuinely gets a new code -- so this can't be used to enumerate
		// which emails are registered.
		if (user && !user.emailVerified) {
			await emailVerificationModel.deleteMany({ user: user._id });
			const code = generateVerificationCode();
			const codeHash = await bcrypt.hash(code, 12);
			await emailVerificationModel.create({
				user: user._id,
				codeHash,
				expiresAt: new Date(Date.now() + CODE_TTL_MS),
			});
			await sendVerificationEmail(user.email, code);
		}

		return res.json({ success: true });
	} catch (err) {
		logger("error", __filename, "", err);
		return res
			.status(INTERNAL_SERVER_ERROR_CODE)
			.json({ success: false, msg: INTERNAL_SERVER_ERROR });
	}
};

module.exports = { resendVerification };
