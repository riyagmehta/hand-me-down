const mongoose = require("mongoose");

const EmailVerificationSchema = mongoose.Schema(
	{
		user: { type: mongoose.Types.ObjectId, ref: "users", required: true },
		// Hashed like a password, not stored in plaintext -- a DB read alone
		// shouldn't hand out a usable code.
		codeHash: { type: String, required: true, select: false },
		expiresAt: { type: Date, required: true },
	},
	{ timestamps: true }
);

module.exports =
	mongoose.models.emailVerifications ||
	mongoose.model("emailVerifications", EmailVerificationSchema);
