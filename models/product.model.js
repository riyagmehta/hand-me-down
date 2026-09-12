const mongoose = require("mongoose");
const { CAMPUS_BUILDING_IDS } = require("../constants/campusBuildings");

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
	// A fixed campus building, not a free-text address -- see
	// constants/campusBuildings.js. "Near my dorm" is an exact match on
	// this field; no geocoding or geospatial index needed for that.
	pickupBuildingId: {
		type: String,
		enum: CAMPUS_BUILDING_IDS,
		required: true,
	},

	// Semester-cycle-aware listings
	status: { type: String, enum: ["active", "archived"], default: "active" },
	listingExpiresAt: { type: Date },

	// Set when this product is part of an active bundle -- locks it out of
	// individual purchase (see placeOrder) until the bundle is sold or
	// cancelled, so it can't be sold twice through two different paths.
	bundledIn: { type: mongoose.Types.ObjectId, ref: "bundles", default: null },

	// Structured textbook fields, optionally auto-filled from a free ISBN
	// lookup (Open Library). courseCode is manual -- no external catalog
	// knows a school's own course numbering.
	textbookDetails: {
		type: new mongoose.Schema(
			{
				isbn: String,
				title: String,
				author: String,
				edition: String,
				courseCode: String,
			},
			{ _id: false }
		),
		required: false,
	},
});

ProductSchema.index({ pickupBuildingId: 1 });

module.exports =
	mongoose.models.products || mongoose.model("products", ProductSchema);
