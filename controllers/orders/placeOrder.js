const mongoose = require("mongoose");
const {
	INVALID_REQUEST_DATA,
	INVALID_REQUEST_DATA_CODE,
	INTERNAL_SERVER_ERROR,
	INTERNAL_SERVER_ERROR_CODE,
	FORBIDDEN_ERROR,
	FORBIDDEN_ERROR_CODE,
	INSUFFICIENT_STOCK_ERROR,
	INSUFFICIENT_STOCK_ERROR_CODE,
} = require("../../constants/constants");
const { logger } = require("../../debugger/logger");
const productModel = require("../../models/product.model");
const orderModel = require("../../models/order.model");

const placeOrder = async (req, res) => {
	const { pid, quantity, idempotencyKey } = req.body;

	if (
		!mongoose.isValidObjectId(pid) ||
		!Number.isInteger(quantity) ||
		quantity < 1 ||
		typeof idempotencyKey !== "string" ||
		idempotencyKey.length === 0
	) {
		return res.status(INVALID_REQUEST_DATA_CODE).json({
			success: false,
			msg: INVALID_REQUEST_DATA,
		});
	}

	try {
		// Fast path for a retried request: if this exact attempt already went
		// through, return its result instead of processing it again. This is
		// an optimization, not the correctness guarantee -- see below.
		const existingOrder = await orderModel.findOne({ idempotencyKey });
		if (existingOrder) {
			return res.json({ success: true, data: existingOrder });
		}

		const product = await productModel.findOne({ _id: pid });
		if (!product) {
			return res.status(INVALID_REQUEST_DATA_CODE).json({
				success: false,
				msg: INVALID_REQUEST_DATA,
			});
		}

		if (product.seller.toString() === req.user.uid) {
			return res.status(FORBIDDEN_ERROR_CODE).json({
				success: false,
				msg: FORBIDDEN_ERROR,
			});
		}

		// The check (counts >= quantity) and the write (decrement) happen as
		// one atomic MongoDB operation, so two concurrent requests can't both
		// see enough stock and both proceed -- the second one's filter is
		// evaluated against the already-decremented document and fails to
		// match instead of overselling.
		const decremented = await productModel.findOneAndUpdate(
			{ _id: pid, counts: { $gte: quantity } },
			{ $inc: { counts: -quantity } },
			{ new: true }
		);

		if (!decremented) {
			return res.status(INSUFFICIENT_STOCK_ERROR_CODE).json({
				success: false,
				msg: INSUFFICIENT_STOCK_ERROR,
			});
		}

		try {
			const order = await orderModel.create({
				product: pid,
				buyer: req.user.uid,
				seller: decremented.seller,
				quantity,
				pricePerUnit: decremented.price,
				totalPrice: decremented.price * quantity,
				idempotencyKey,
			});
			return res.json({ success: true, data: order });
		} catch (err) {
			// Creating the order failed -- give back the stock we reserved so
			// a mid-flight failure never leaves counts silently short.
			await productModel.updateOne({ _id: pid }, { $inc: { counts: quantity } });

			if (err.code === 11000) {
				// Someone else's concurrent request with this same idempotency
				// key won the race to create the order. The unique index on
				// idempotencyKey is what actually makes this safe -- the
				// findOne check above is just an optimization for the common
				// case, since two racing requests can both pass it before
				// either has inserted.
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

module.exports = { placeOrder };
