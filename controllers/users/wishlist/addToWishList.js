const { default: mongoose } = require("mongoose");
const userModel = require("../../../models/user.model");
const {
	INVALID_REQUEST_DATA_CODE,
	INVALID_REQUEST_DATA,
	INTERNAL_SERVER_ERROR_CODE,
	INTERNAL_SERVER_ERROR,
} = require("../../../constants/constants");
const { logger } = require("../../../debugger/logger");

const addToWishList = async (req, res) => {
	const { uid } = req.query;
	const { pid } = req.body;

	if (!mongoose.isValidObjectId(uid) || !mongoose.isValidObjectId(pid))
		return res.status(INVALID_REQUEST_DATA_CODE).json({
			success: false,
			msg: INVALID_REQUEST_DATA,
		});

	try {
		const updatedUser = await userModel.findOneAndUpdate(
			{ _id: uid },
			{
				$addToSet: {
					wishlist: pid,
				},
			},
			{ new: true }
		);

		if (!updatedUser) {
			return res.status(INVALID_REQUEST_DATA_CODE).json({
				success: false,
				msg: INVALID_REQUEST_DATA,
				action: "Searching User",
			});
		}

		return res.json({
			success: true,
			data: updatedUser,
		});
	} catch (err) {
		logger("error", __filename, "", err);
		return res
			.status(INTERNAL_SERVER_ERROR_CODE)
			.json({ success: false, msg: INTERNAL_SERVER_ERROR });
	}
};

module.exports = { addToWishList };
