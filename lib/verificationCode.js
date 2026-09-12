const crypto = require("crypto");

const CODE_LENGTH = 6;
const CODE_TTL_MS = 15 * 60 * 1000; // 15 minutes

const generateVerificationCode = () => {
	const max = 10 ** CODE_LENGTH;
	return crypto.randomInt(0, max).toString().padStart(CODE_LENGTH, "0");
};

module.exports = { generateVerificationCode, CODE_TTL_MS };
