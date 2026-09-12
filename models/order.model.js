const mongoose = require("mongoose");

const OrderSchema = mongoose.Schema(
	{
		// Exactly one of product/bundle is set, enforced by the two
		// controllers that create orders (placeOrder vs purchaseBundle) --
		// not by a schema-level constraint, since Mongoose doesn't have a
		// clean native "exactly one of" validator across sibling paths.
		product: { type: mongoose.Types.ObjectId, ref: "products" },
		bundle: { type: mongoose.Types.ObjectId, ref: "bundles" },
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
