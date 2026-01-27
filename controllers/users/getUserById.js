const {
	INTERNAL_SERVER_ERROR_CODE,
	INTERNAL_SERVER_ERROR,
	INVALID_REQUEST_DATA_CODE,
	INVALID_REQUEST_DATA,
} = require("../../constants/constants");
const { logger } = require("../../debugger/logger");
const userModel = require("../../models/user.model");
const mongoose = require("mongoose");

const getUserById = async (req, res) => {
	const { uid } = req.query;

	if (!mongoose.isValidObjectId(uid))
		return res.status(INVALID_REQUEST_DATA_CODE).json({
			success: false,
			msg: INVALID_REQUEST_DATA,
			action: "uid Validation",
		});

	try {
		const foundUser = await userModel.findOne({ _id: uid });

		if (!foundUser) {
			return res.status(INVALID_REQUEST_DATA_CODE).json({
				success: false,
				msg: INVALID_REQUEST_DATA,
				action: "Searching User",
			});
		}

		return res.json({
			success: true,
			data: foundUser,
		});
	} catch (err) {
		logger("error", __filename, "", err);
		return res
			.status(INTERNAL_SERVER_ERROR_CODE)
			.json({ success: false, msg: INTERNAL_SERVER_ERROR });
	}
};

module.exports = { getUserById };
