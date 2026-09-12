const {
	INTERNAL_SERVER_ERROR_CODE,
	INTERNAL_SERVER_ERROR,
} = require("../../constants/constants");
const { logger } = require("../../debugger/logger");
const userModel = require("../../models/user.model");

const getMe = async (req, res) => {
	try {
		const foundUser = await userModel.findOne({ _id: req.user.uid });

		if (!foundUser) {
			return res.status(INTERNAL_SERVER_ERROR_CODE).json({
				success: false,
				msg: INTERNAL_SERVER_ERROR,
			});
		}

		return res.json({ success: true, data: foundUser });
	} catch (err) {
		logger("error", __filename, "", err);
		return res
			.status(INTERNAL_SERVER_ERROR_CODE)
			.json({ success: false, msg: INTERNAL_SERVER_ERROR });
	}
};

module.exports = { getMe };
