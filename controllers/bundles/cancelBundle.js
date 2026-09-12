const mongoose = require("mongoose");
const {
	INVALID_REQUEST_DATA,
	INVALID_REQUEST_DATA_CODE,
	INTERNAL_SERVER_ERROR,
	INTERNAL_SERVER_ERROR_CODE,
} = require("../../constants/constants");
const { logger } = require("../../debugger/logger");
const bundleModel = require("../../models/bundle.model");
const productModel = require("../../models/product.model");

const cancelBundle = async (req, res) => {
	const { bid } = req.query;

	if (!mongoose.isValidObjectId(bid)) {
		return res.status(INVALID_REQUEST_DATA_CODE).json({
			success: false,
			msg: INVALID_REQUEST_DATA,
		});
	}

	try {
		const bundle = await bundleModel.findOneAndUpdate(
			{ _id: bid, seller: req.user.uid, status: "active" },
			{ status: "cancelled" },
			{ new: true }
		);

		if (!bundle) {
			return res.status(INVALID_REQUEST_DATA_CODE).json({
				success: false,
				msg: INVALID_REQUEST_DATA,
			});
		}

		await productModel.updateMany({ _id: { $in: bundle.items } }, { bundledIn: null });

		return res.json({ success: true, data: bundle });
	} catch (err) {
		logger("error", __filename, "", err);
		return res
			.status(INTERNAL_SERVER_ERROR_CODE)
			.json({ success: false, msg: INTERNAL_SERVER_ERROR });
	}
};

module.exports = { cancelBundle };
