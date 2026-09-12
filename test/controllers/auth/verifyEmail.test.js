const httpMocks = require("node-mocks-http");
const dbConnect = require("../../../lib/dbConnect").default;
const userModel = require("../../../models/user.model");
const emailVerificationModel = require("../../../models/emailVerification.model");
const { postUser } = require("../../../controllers/users/postUser");
const { verifyEmail } = require("../../../controllers/auth/verifyEmail");

jest.mock("../../../lib/mailer");
const { sendVerificationEmail } = require("../../../lib/mailer");

beforeAll(async () => {
	await dbConnect();
});

beforeEach(() => {
	sendVerificationEmail.mockResolvedValue(true);
});

async function registerAndGetCode(email) {
	const req = httpMocks.createRequest({
		method: "POST",
		body: { email, password: "hunter22" },
	});
	await postUser(req, httpMocks.createResponse());
	return sendVerificationEmail.mock.calls[sendVerificationEmail.mock.calls.length - 1][1];
}

function callVerifyEmail(body) {
	const req = httpMocks.createRequest({ method: "POST", body });
	const res = httpMocks.createResponse();
	return verifyEmail(req, res).then(() => res);
}

describe("verifyEmail", () => {
	it("verifies the account with the correct code", async () => {
		const code = await registerAndGetCode("verify1@example.edu");

		const res = await callVerifyEmail({ email: "verify1@example.edu", code });

		expect(res.statusCode).toBe(200);
		const user = await userModel.findOne({ email: "verify1@example.edu" });
		expect(user.emailVerified).toBe(true);
	});

	it("deletes the verification record after a successful verification", async () => {
		const code = await registerAndGetCode("verify2@example.edu");
		await callVerifyEmail({ email: "verify2@example.edu", code });

		const user = await userModel.findOne({ email: "verify2@example.edu" });
		const remaining = await emailVerificationModel.countDocuments({ user: user._id });
		expect(remaining).toBe(0);
	});

	it("rejects an incorrect code", async () => {
		await registerAndGetCode("verify3@example.edu");

		const res = await callVerifyEmail({ email: "verify3@example.edu", code: "000000" });

		expect(res.statusCode).toBe(400);
		const user = await userModel.findOne({ email: "verify3@example.edu" });
		expect(user.emailVerified).toBe(false);
	});

	it("rejects an expired code", async () => {
		const code = await registerAndGetCode("verify4@example.edu");
		const user = await userModel.findOne({ email: "verify4@example.edu" });
		await emailVerificationModel.updateMany(
			{ user: user._id },
			{ expiresAt: new Date(Date.now() - 1000) }
		);

		const res = await callVerifyEmail({ email: "verify4@example.edu", code });

		expect(res.statusCode).toBe(400);
	});

	it("is a no-op success for an already-verified account", async () => {
		const code = await registerAndGetCode("verify5@example.edu");
		await callVerifyEmail({ email: "verify5@example.edu", code });

		const res = await callVerifyEmail({ email: "verify5@example.edu", code });

		expect(res.statusCode).toBe(200);
	});
});
