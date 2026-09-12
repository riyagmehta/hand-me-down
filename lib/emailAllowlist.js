// Placeholder default -- swap for the real school domain(s) via
// ALLOWED_EMAIL_DOMAINS (comma-separated) before deploying for real.
const DEFAULT_ALLOWED_DOMAINS = ["example.edu"];

const getAllowedDomains = () => {
	const configured = process.env.ALLOWED_EMAIL_DOMAINS;
	if (!configured) return DEFAULT_ALLOWED_DOMAINS;
	return configured
		.split(",")
		.map((domain) => domain.trim().toLowerCase())
		.filter(Boolean);
};

const isAllowedEmailDomain = (email) => {
	if (typeof email !== "string" || !email.includes("@")) return false;
	const domain = email.split("@").pop().toLowerCase();
	return getAllowedDomains().includes(domain);
};

module.exports = { isAllowedEmailDomain, getAllowedDomains };
