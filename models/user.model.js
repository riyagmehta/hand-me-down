const mongoose = require("mongoose");
const { CAMPUS_BUILDING_IDS } = require("../constants/campusBuildings");

const AddressSchema = mongoose.Schema({
	city: { type: String, default: "" },
	district: { type: String, default: "" },
	state: { type: String, default: "" },
	postalCode: { type: String, default: 0 },
	completeAddress: { type: String, default: "" },
});

const UserSchema = mongoose.Schema({
	// personal information
	firstName: { type: String, default: "" },
	middleName: { type: String, default: "" },
	lastName: { type: String, default: "" },
	// gender: { type: String, enum: ["male", "female", "other", ""], default: "" },
	dateOfBirth: { type: String },

	// contact information
	email: { type: String, default: "", unique: true },
	phoneNumber: { type: String, default: "" },
	avatarURL: { type: String, default: "" },
	// credential
	password: { type: String, required: true, select: false },

	// school-verified identity
	emailVerified: { type: Boolean, default: false },
	// The year this student graduates (or graduated). Class standing
	// (freshman/junior/senior/etc) is deliberately not stored -- it's
	// derived from this plus the current date in lib/academic.js, so it
	// can't go stale the way a stored label would.
	graduationYear: { type: Number },
	major: { type: String },
	courses: [String],
	// Default building for "items near my dorm" -- optional, overridable
	// per search.
	dormBuildingId: { type: String, enum: CAMPUS_BUILDING_IDS },

	// address
	address: {
		type: AddressSchema,
	},
	social: {
		whatsapp: Number,
		instagram: String,
		facebook: String,
	},
	wishlist: [mongoose.Types.ObjectId],
});

module.exports = mongoose.models.users || mongoose.model("users", UserSchema);
