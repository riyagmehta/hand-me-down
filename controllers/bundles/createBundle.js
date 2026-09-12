const mongoose = require("mongoose");
const {
	INVALID_REQUEST_DATA,
	INVALID_REQUEST_DATA_CODE,
	FORBIDDEN_ERROR,
	FORBIDDEN_ERROR_CODE,
	INTERNAL_SERVER_ERROR,
	INTERNAL_SERVER_ERROR_CODE,
} = require("../../constants/constants");
const { logger } = require("../../debugger/logger");
const productModel = require("../../models/product.model");
const bundleModel = require("../../models/bundle.model");

const MIN_BUNDLE_ITEMS = 2;

const createBundle = async (req, res) => {
	const { items, bundlePrice } = req.body;

	if (
		!Array.isArray(items) ||
		items.length < MIN_BUNDLE_ITEMS ||
		!items.every((id) => mongoose.isValidObjectId(id)) ||
		typeof bundlePrice !== "number" ||
		bundlePrice < 0
	) {
		return res.status(INVALID_REQUEST_DATA_CODE).json({
			success: false,
			msg: INVALID_REQUEST_DATA,
		});
	}

	try {
		const products = await productModel.find({ _id: { $in: items } });

		if (products.length !== items.length) {
			return res.status(INVALID_REQUEST_DATA_CODE).json({
				success: false,
				msg: INVALID_REQUEST_DATA,
			});
		}

		const notOwnedOrUnavailable = products.some(
			(product) => product.seller.toString() !== req.user.uid || product.bundledIn
		);
		if (notOwnedOrUnavailable) {
			return res.status(FORBIDDEN_ERROR_CODE).json({
				success: false,
				msg: FORBIDDEN_ERROR,
			});
		}

		const bundle = await bundleModel.create({
			seller: req.user.uid,
			items,
			bundlePrice,
		});

		await productModel.updateMany({ _id: { $in: items } }, { bundledIn: bundle._id });

		return res.json({ success: true, data: bundle });
	} catch (err) {
		logger("error", __filename, "", err);
		return res
			.status(INTERNAL_SERVER_ERROR_CODE)
			.json({ success: false, msg: INTERNAL_SERVER_ERROR });
	}
};

module.exports = { createBundle };
