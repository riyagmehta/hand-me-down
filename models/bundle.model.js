const mongoose = require("mongoose");

const BundleSchema = mongoose.Schema(
	{
		seller: { type: mongoose.Types.ObjectId, ref: "users", required: true },
		// References existing Product docs rather than duplicating their
		// details -- a single source of truth per item, at the cost of the
		// items being locked out of individual sale while bundled (see
		// Product.bundledIn).
		items: [{ type: mongoose.Types.ObjectId, ref: "products", required: true }],
		bundlePrice: { type: Number, required: true, min: 0 },
		status: { type: String, enum: ["active", "sold", "cancelled"], default: "active" },
	},
	{ timestamps: true }
);

module.exports = mongoose.models.bundles || mongoose.model("bundles", BundleSchema);
