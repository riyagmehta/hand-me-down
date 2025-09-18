const mongoose = require("mongoose");

const ProductSchema = mongoose.Schema({
	name: { type: String, required: true },
	seller: { type: mongoose.Types.ObjectId, req: true },
	price: { type: Number, default: 0.0 },
	counts: { type: Number, default: 1 },
	description: { type: String },
	featuredImage: { type: String },
	productImages: [String],
	categories: [String],
	condition: {
		type: String,
		enum: ["very-good", "good", "average", "poor"],
		required: true,
	},
	pickupAddress: { type: String, required: true },
});

module.exports =
	mongoose.models.products || mongoose.model("products", ProductSchema);
