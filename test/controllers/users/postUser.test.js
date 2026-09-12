const httpMocks = require("node-mocks-http");
const bcrypt = require("bcryptjs");
const dbConnect = require("../../../lib/dbConnect").default;
const userModel = require("../../../models/user.model");
const emailVerificationModel = require("../../../models/emailVerification.model");
const { postUser } = require("../../../controllers/users/postUser");

jest.mock("../../../lib/mailer");
const { sendVerificationEmail } = require("../../../lib/mailer");

beforeAll(async () => {
	await dbConnect();
});

beforeEach(() => {
	sendVerificationEmail.mockReset().mockResolvedValue(true);
});

describe("postUser", () => {
	it("stores a bcrypt hash instead of the plaintext password", async () => {
		const req = httpMocks.createRequest({
			method: "POST",
			body: { email: "a@example.edu", password: "correct horse battery staple" },
		});
		const res = httpMocks.createResponse();

		await postUser(req, res);

		const saved = await userModel
			.findOne({ email: "a@example.edu" })
			.select("+password");
		expect(saved.password).not.toBe("correct horse battery staple");
		expect(await bcrypt.compare("correct horse battery staple", saved.password)).toBe(
			true
		);
	});

	it("ignores client-supplied fields outside the registration allow-list", async () => {
		const req = httpMocks.createRequest({
			method: "POST",
			body: {
				email: "mass-assignment@example.edu",
				password: "hunter22",
				wishlist: ["000000000000000000000000"],
			},
		});
		const res = httpMocks.createResponse();

		await postUser(req, res);

		const saved = await userModel.findOne({ email: "mass-assignment@example.edu" });
		expect(saved.wishlist).toHaveLength(0);
	});

	it("never returns the password hash in the response body", async () => {
		const req = httpMocks.createRequest({
			method: "POST",
			body: { email: "hash-leak@example.edu", password: "hunter22" },
		});
		const res = httpMocks.createResponse();

		await postUser(req, res);

		const body = res._getJSONData();
		expect(body.data.password).toBeUndefined();
	});

	it("rejects registration with no password instead of crashing", async () => {
		const req = httpMocks.createRequest({
			method: "POST",
			body: { email: "b@example.edu" },
		});
		const res = httpMocks.createResponse();

		await postUser(req, res);

		expect(res.statusCode).toBe(400);
		const found = await userModel.findOne({ email: "b@example.edu" });
		expect(found).toBeNull();
	});

	it("rejects an email outside the allowed school domains", async () => {
		const req = httpMocks.createRequest({
			method: "POST",
			body: { email: "someone@gmail.com", password: "hunter22" },
		});
		const res = httpMocks.createResponse();

		await postUser(req, res);

		expect(res.statusCode).toBe(400);
		const found = await userModel.findOne({ email: "someone@gmail.com" });
		expect(found).toBeNull();
	});

	it("rejects a second registration with an already-used email", async () => {
		const first = httpMocks.createRequest({
			method: "POST",
			body: { email: "dup@example.edu", password: "hunter22" },
		});
		await postUser(first, httpMocks.createResponse());

		const second = httpMocks.createRequest({
			method: "POST",
			body: { email: "dup@example.edu", password: "someotherpassword" },
		});
		const res = httpMocks.createResponse();
		await postUser(second, res);

		expect(res.statusCode).toBe(409);
		const count = await userModel.countDocuments({ email: "dup@example.edu" });
		expect(count).toBe(1);
	});

	it("creates an unverified account and sends a verification code", async () => {
		const req = httpMocks.createRequest({
			method: "POST",
			body: { email: "verify-me@example.edu", password: "hunter22" },
		});
		const res = httpMocks.createResponse();

		await postUser(req, res);

		const saved = await userModel.findOne({ email: "verify-me@example.edu" });
		expect(saved.emailVerified).toBe(false);

		expect(sendVerificationEmail).toHaveBeenCalledTimes(1);
		const [emailArg, codeArg] = sendVerificationEmail.mock.calls[0];
		expect(emailArg).toBe("verify-me@example.edu");
		expect(codeArg).toMatch(/^\d{6}$/);

		const record = await emailVerificationModel.findOne({ user: saved._id });
		expect(record).not.toBeNull();
		expect(record.expiresAt.getTime()).toBeGreaterThan(Date.now());
	});
});
