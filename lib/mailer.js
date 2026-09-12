const { logger } = require("../debugger/logger");

// Simulated delivery: logs instead of sending a real email, so the
// verification flow is fully demoable without managing real email
// credentials. Swap this out for a real transport (e.g. Nodemailer over an
// SMTP account) behind this same function signature when real delivery is
// needed -- nothing else in the verification flow depends on how sending
// actually happens.
const sendVerificationEmail = async (email, code) => {
	logger("info", __filename, "verification code (simulated send, not actually emailed)", {
		email,
		code,
	});
	return true;
};

module.exports = { sendVerificationEmail };
