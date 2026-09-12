const mongoose = require("mongoose");
const {
	INVALID_REQUEST_DATA,
	INVALID_REQUEST_DATA_CODE,
	INTERNAL_SERVER_ERROR,
	INTERNAL_SERVER_ERROR_CODE,
} = require("../../constants/constants");
const { logger } = require("../../debugger/logger");
const orderModel = require("../../models/order.model");
const productModel = require("../../models/product.model");

const cancelOrder = async (req, res) => {
	const { oid } = req.query;

	if (!mongoose.isValidObjectId(oid)) {
		return res.status(INVALID_REQUEST_DATA_CODE).json({
			success: false,
			msg: INVALID_REQUEST_DATA,
		});
	}

	try {
		// Atomically flip status only if it's still "placed" -- if two cancel
		// requests race (or a client double-submits), only one can match this
		// filter and actually transition the order, the same document-level
		// atomicity pattern as the stock decrement in placeOrder.
		const order = await orderModel.findOneAndUpdate(
			{
				_id: oid,
				status: "placed",
				$or: [{ buyer: req.user.uid }, { seller: req.user.uid }],
			},
			{ status: "cancelled" },
			{ new: true }
		);

		if (!order) {
			return res.status(INVALID_REQUEST_DATA_CODE).json({
				success: false,
				msg: INVALID_REQUEST_DATA,
			});
		}

		try {
			await productModel.updateOne(
				{ _id: order.product },
				{ $inc: { counts: order.quantity } }
			);
		} catch (err) {
			// Restock failed -- put the order back so it isn't silently
			// cancelled without the stock actually being returned.
			await orderModel.updateOne({ _id: order._id }, { status: "placed" });
			throw err;
		}

		await order.populate(["product", "buyer", "seller"]);

		return res.json({ success: true, data: order });
	} catch (err) {
		logger("error", __filename, "", err);
		return res
			.status(INTERNAL_SERVER_ERROR_CODE)
			.json({ success: false, msg: INTERNAL_SERVER_ERROR });
	}
};

module.exports = { cancelOrder };
