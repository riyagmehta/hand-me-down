const mongoose = require("mongoose");

const OrderSchema = mongoose.Schema(
	{
		product: { type: mongoose.Types.ObjectId, ref: "products", required: true },
		buyer: { type: mongoose.Types.ObjectId, ref: "users", required: true },
		seller: { type: mongoose.Types.ObjectId, ref: "users", required: true },
		quantity: { type: Number, required: true, min: 1 },
		pricePerUnit: { type: Number, required: true },
		totalPrice: { type: Number, required: true },
		status: { type: String, default: "placed" },
		idempotencyKey: { type: String, required: true, unique: true },
	},
	{ timestamps: true }
);

module.exports = mongoose.models.orders || mongoose.model("orders", OrderSchema);
