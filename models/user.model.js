const mongoose = require("mongoose");

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
	email: { type: String, default: "" },
	phoneNumber: { type: String, default: "" },
	avatarURL: { type: String, default: "" },
	// credential
	password: { type: String, required: true },

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
