const { default: mongoose } = require("mongoose");
const {
	INVALID_REQUEST_DATA_CODE,
	INVALID_REQUEST_DATA,
	INTERNAL_SERVER_ERROR_CODE,
	INTERNAL_SERVER_ERROR,
} = require("../../../constants/constants");
const userModel = require("../../../models/user.model");
const productModel = require("../../../models/product.model");
const { logger } = require("../../../debugger/logger");

const getWishList = async (req, res) => {
	const { uid } = req.query;

	if (!mongoose.isValidObjectId(uid))
		return res.status(INVALID_REQUEST_DATA_CODE).json({
			success: false,
			msg: INVALID_REQUEST_DATA,
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

		let wishlistIds = [];
		wishlistIds = foundUser.wishlist;

		const wishlistData = await Promise.all(
			wishlistIds.map((pid) => productModel.findOne({ _id: pid }))
		);

		return res.json({
			success: true,
			data: wishlistData,
		});
	} catch (err) {
		logger("error", __filename, "", err);
		return res
			.status(INTERNAL_SERVER_ERROR_CODE)
			.json({ success: false, msg: INTERNAL_SERVER_ERROR });
	}
};

module.exports = { getWishList };
