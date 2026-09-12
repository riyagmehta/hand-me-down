const bcrypt = require("bcryptjs");
const {
	INVALID_REQUEST_DATA,
	INVALID_REQUEST_DATA_CODE,
	INVALID_OR_EXPIRED_CODE,
	INVALID_OR_EXPIRED_CODE_CODE,
	INTERNAL_SERVER_ERROR,
	INTERNAL_SERVER_ERROR_CODE,
} = require("../../constants/constants");
const { logger } = require("../../debugger/logger");
const userModel = require("../../models/user.model");
const emailVerificationModel = require("../../models/emailVerification.model");

const verifyEmail = async (req, res) => {
	const { email, code } = req.body;

	if (!email || !code) {
		return res.status(INVALID_REQUEST_DATA_CODE).json({
			success: false,
			msg: INVALID_REQUEST_DATA,
		});
	}

	try {
		const user = await userModel.findOne({ email });
		if (!user) {
			return res.status(INVALID_REQUEST_DATA_CODE).json({
				success: false,
				msg: INVALID_REQUEST_DATA,
			});
		}

		if (user.emailVerified) {
			return res.json({ success: true, data: { alreadyVerified: true } });
		}

		const record = await emailVerificationModel
			.findOne({ user: user._id })
			.sort({ createdAt: -1 })
			.select("+codeHash");

		if (!record || record.expiresAt.getTime() < Date.now()) {
			return res.status(INVALID_OR_EXPIRED_CODE_CODE).json({
				success: false,
				msg: INVALID_OR_EXPIRED_CODE,
			});
		}

		const matches = await bcrypt.compare(code, record.codeHash);
		if (!matches) {
			return res.status(INVALID_OR_EXPIRED_CODE_CODE).json({
				success: false,
				msg: INVALID_OR_EXPIRED_CODE,
			});
		}

		user.emailVerified = true;
		await user.save();
		await emailVerificationModel.deleteMany({ user: user._id });

		return res.json({ success: true, data: { verified: true } });
	} catch (err) {
		logger("error", __filename, "", err);
		return res
			.status(INTERNAL_SERVER_ERROR_CODE)
			.json({ success: false, msg: INTERNAL_SERVER_ERROR });
	}
};

module.exports = { verifyEmail };
