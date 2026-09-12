const mongoose = require("mongoose");
const {
	INVALID_REQUEST_DATA,
	INVALID_REQUEST_DATA_CODE,
	FORBIDDEN_ERROR,
	FORBIDDEN_ERROR_CODE,
	INSUFFICIENT_STOCK_ERROR,
	INSUFFICIENT_STOCK_ERROR_CODE,
	INTERNAL_SERVER_ERROR,
	INTERNAL_SERVER_ERROR_CODE,
} = require("../../constants/constants");
const { logger } = require("../../debugger/logger");
const bundleModel = require("../../models/bundle.model");
const productModel = require("../../models/product.model");
const orderModel = require("../../models/order.model");

// A bundle purchase has to reserve stock across N separate product
// documents as one unit of work. MongoDB multi-document transactions could
// do that, but they require the deployment to be a replica set (Atlas's
// free M0 tier qualifies; a bare standalone mongod doesn't) -- so instead
// this uses a saga: the same atomic per-document conditional decrement as
// placeOrder, applied to each item in turn, with an explicit compensating
// rollback if any step fails partway through. That's also the more
// portable choice: it works on any MongoDB deployment, not just ones
// provisioned as a replica set.
const purchaseBundle = async (req, res) => {
	const { bundleId, idempotencyKey } = req.body;

	if (
		!mongoose.isValidObjectId(bundleId) ||
		typeof idempotencyKey !== "string" ||
		idempotencyKey.length === 0
	) {
		return res.status(INVALID_REQUEST_DATA_CODE).json({
			success: false,
			msg: INVALID_REQUEST_DATA,
		});
	}

	try {
		const existingOrder = await orderModel.findOne({ idempotencyKey });
		if (existingOrder) {
			return res.json({ success: true, data: existingOrder });
		}

		const bundle = await bundleModel.findOne({ _id: bundleId, status: "active" });
		if (!bundle) {
			return res.status(INVALID_REQUEST_DATA_CODE).json({
				success: false,
				msg: INVALID_REQUEST_DATA,
			});
		}

		if (bundle.seller.toString() === req.user.uid) {
			return res.status(FORBIDDEN_ERROR_CODE).json({
				success: false,
				msg: FORBIDDEN_ERROR,
			});
		}

		// The real oversell guard is this per-item atomic decrement, same as
		// placeOrder -- not the bundle.status flip below, which is bookkeeping
		// only. If two buyers race the same bundle, at most one of them can
		// win the decrement on the *first* shared item (each item still has
		// its own counts:{$gte:1} filter), so both can't complete the saga.
		const reservedItemIds = [];
		let outOfStockItemId = null;

		for (const productId of bundle.items) {
			const decremented = await productModel.findOneAndUpdate(
				{ _id: productId, counts: { $gte: 1 } },
				{ $inc: { counts: -1 } },
				{ new: true }
			);
			if (!decremented) {
				outOfStockItemId = productId;
				break;
			}
			reservedItemIds.push(productId);
		}

		if (outOfStockItemId) {
			await Promise.all(
				reservedItemIds.map((productId) =>
					productModel.updateOne({ _id: productId }, { $inc: { counts: 1 } })
				)
			);
			return res.status(INSUFFICIENT_STOCK_ERROR_CODE).json({
				success: false,
				msg: INSUFFICIENT_STOCK_ERROR,
			});
		}

		try {
			const order = await orderModel.create({
				bundle: bundle._id,
				buyer: req.user.uid,
				seller: bundle.seller,
				quantity: bundle.items.length,
				pricePerUnit: bundle.bundlePrice,
				totalPrice: bundle.bundlePrice,
				idempotencyKey,
			});

			await bundleModel.updateOne({ _id: bundle._id }, { status: "sold" });

			return res.json({ success: true, data: order });
		} catch (err) {
			await Promise.all(
				reservedItemIds.map((productId) =>
					productModel.updateOne({ _id: productId }, { $inc: { counts: 1 } })
				)
			);

			if (err.code === 11000) {
				const winningOrder = await orderModel.findOne({ idempotencyKey });
				return res.json({ success: true, data: winningOrder });
			}

			throw err;
		}
	} catch (err) {
		logger("error", __filename, "", err);
		return res
			.status(INTERNAL_SERVER_ERROR_CODE)
			.json({ success: false, msg: INTERNAL_SERVER_ERROR });
	}
};

module.exports = { purchaseBundle };
