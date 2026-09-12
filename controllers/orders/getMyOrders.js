const {
	INTERNAL_SERVER_ERROR_CODE,
	INTERNAL_SERVER_ERROR,
} = require("../../constants/constants");
const { logger } = require("../../debugger/logger");
const orderModel = require("../../models/order.model");

const getMyOrders = async (req, res) => {
	try {
		const orders = await orderModel
			.find({ $or: [{ buyer: req.user.uid }, { seller: req.user.uid }] })
			.sort({ createdAt: -1 })
			.populate("product")
			.populate("buyer")
			.populate("seller");

		return res.json({ success: true, data: orders });
	} catch (err) {
		logger("error", __filename, "", err);
		return res
			.status(INTERNAL_SERVER_ERROR_CODE)
			.json({ success: false, msg: INTERNAL_SERVER_ERROR });
	}
};

module.exports = { getMyOrders };
