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
	// Best-effort geocode of pickupAddress -- a real subdocument (not a plain
	// nested object) so it stays genuinely absent when geocoding failed or
	// hasn't run yet, instead of materializing as {}. GeoJSON coordinate
	// order is [lng, lat].
	location: {
		type: new mongoose.Schema(
			{
				type: { type: String, enum: ["Point"] },
				coordinates: { type: [Number] },
			},
			{ _id: false }
		),
		required: false,
	},
});

ProductSchema.index({ location: "2dsphere" });

module.exports =
	mongoose.models.products || mongoose.model("products", ProductSchema);
