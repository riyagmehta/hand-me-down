const httpMocks = require("node-mocks-http");
const bcrypt = require("bcryptjs");
const dbConnect = require("../../../lib/dbConnect").default;
const userModel = require("../../../models/user.model");
const { postUser } = require("../../../controllers/users/postUser");

beforeAll(async () => {
	await dbConnect();
});

describe("postUser", () => {
	it("stores a bcrypt hash instead of the plaintext password", async () => {
		const req = httpMocks.createRequest({
			method: "POST",
			body: { email: "a@example.com", password: "correct horse battery staple" },
		});
		const res = httpMocks.createResponse();

		await postUser(req, res);

		const saved = await userModel.findOne({ email: "a@example.com" });
		expect(saved.password).not.toBe("correct horse battery staple");
		expect(await bcrypt.compare("correct horse battery staple", saved.password)).toBe(
			true
		);
	});

	it("rejects registration with no password instead of crashing", async () => {
		const req = httpMocks.createRequest({
			method: "POST",
			body: { email: "b@example.com" },
		});
		const res = httpMocks.createResponse();

		await postUser(req, res);

		expect(res.statusCode).toBe(400);
		const found = await userModel.findOne({ email: "b@example.com" });
		expect(found).toBeNull();
	});
});
