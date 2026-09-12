describe("isAllowedEmailDomain", () => {
	const realEnv = process.env.ALLOWED_EMAIL_DOMAINS;

	afterEach(() => {
		process.env.ALLOWED_EMAIL_DOMAINS = realEnv;
		jest.resetModules();
	});

	it("accepts an email on the default allowed domain when unconfigured", () => {
		delete process.env.ALLOWED_EMAIL_DOMAINS;
		jest.resetModules();
		const { isAllowedEmailDomain } = require("../../lib/emailAllowlist");

		expect(isAllowedEmailDomain("student@example.edu")).toBe(true);
	});

	it("rejects a non-.edu domain by default", () => {
		delete process.env.ALLOWED_EMAIL_DOMAINS;
		jest.resetModules();
		const { isAllowedEmailDomain } = require("../../lib/emailAllowlist");

		expect(isAllowedEmailDomain("someone@gmail.com")).toBe(false);
	});

	it("respects a configured comma-separated allowlist", () => {
		process.env.ALLOWED_EMAIL_DOMAINS = "school-a.edu, school-b.edu";
		jest.resetModules();
		const { isAllowedEmailDomain } = require("../../lib/emailAllowlist");

		expect(isAllowedEmailDomain("student@school-a.edu")).toBe(true);
		expect(isAllowedEmailDomain("student@school-b.edu")).toBe(true);
		expect(isAllowedEmailDomain("student@example.edu")).toBe(false);
	});

	it("is case-insensitive on the domain", () => {
		delete process.env.ALLOWED_EMAIL_DOMAINS;
		jest.resetModules();
		const { isAllowedEmailDomain } = require("../../lib/emailAllowlist");

		expect(isAllowedEmailDomain("student@EXAMPLE.EDU")).toBe(true);
	});

	it("accepts any domain matching a configured wildcard suffix", () => {
		process.env.ALLOWED_EMAIL_DOMAINS = ".edu";
		jest.resetModules();
		const { isAllowedEmailDomain } = require("../../lib/emailAllowlist");

		expect(isAllowedEmailDomain("student@sfsu.edu")).toBe(true);
		expect(isAllowedEmailDomain("student@cs.berkeley.edu")).toBe(true);
		expect(isAllowedEmailDomain("someone@gmail.com")).toBe(false);
	});

	it("rejects malformed input instead of throwing", () => {
		delete process.env.ALLOWED_EMAIL_DOMAINS;
		jest.resetModules();
		const { isAllowedEmailDomain } = require("../../lib/emailAllowlist");

		expect(isAllowedEmailDomain("not-an-email")).toBe(false);
		expect(isAllowedEmailDomain(undefined)).toBe(false);
	});
});
