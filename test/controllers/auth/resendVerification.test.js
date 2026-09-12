const httpMocks = require("node-mocks-http");
const dbConnect = require("../../../lib/dbConnect").default;
const userModel = require("../../../models/user.model");
const emailVerificationModel = require("../../../models/emailVerification.model");
const { postUser } = require("../../../controllers/users/postUser");
const { resendVerification } = require("../../../controllers/auth/resendVerification");

jest.mock("../../../lib/mailer");
const { sendVerificationEmail } = require("../../../lib/mailer");

beforeAll(async () => {
	await dbConnect();
});

beforeEach(() => {
	sendVerificationEmail.mockResolvedValue(true);
	sendVerificationEmail.mockClear();
});

function callResend(email) {
	const req = httpMocks.createRequest({ method: "POST", body: { email } });
	const res = httpMocks.createResponse();
	return resendVerification(req, res).then(() => res);
}

describe("resendVerification", () => {
	it("invalidates the old code and issues a new one", async () => {
		const req = httpMocks.createRequest({
			method: "POST",
			body: { email: "resend1@example.edu", password: "hunter22" },
		});
		await postUser(req, httpMocks.createResponse());
		const user = await userModel.findOne({ email: "resend1@example.edu" });
		sendVerificationEmail.mockClear();

		const res = await callResend("resend1@example.edu");

		expect(res.statusCode).toBe(200);
		expect(sendVerificationEmail).toHaveBeenCalledTimes(1);
		const records = await emailVerificationModel.find({ user: user._id });
		expect(records).toHaveLength(1);
	});

	it("returns success without sending anything for an unregistered email", async () => {
		const res = await callResend("nobody@example.edu");

		expect(res.statusCode).toBe(200);
		expect(sendVerificationEmail).not.toHaveBeenCalled();
	});

	it("returns success without sending anything for an already-verified account", async () => {
		const req = httpMocks.createRequest({
			method: "POST",
			body: { email: "already-verified@example.edu", password: "hunter22" },
		});
		await postUser(req, httpMocks.createResponse());
		await userModel.updateOne(
			{ email: "already-verified@example.edu" },
			{ emailVerified: true }
		);
		sendVerificationEmail.mockClear();

		const res = await callResend("already-verified@example.edu");

		expect(res.statusCode).toBe(200);
		expect(sendVerificationEmail).not.toHaveBeenCalled();
	});
});
