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

		const saved = await userModel
			.findOne({ email: "a@example.com" })
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
				email: "mass-assignment@example.com",
				password: "hunter22",
				wishlist: ["000000000000000000000000"],
			},
		});
		const res = httpMocks.createResponse();

		await postUser(req, res);

		const saved = await userModel.findOne({ email: "mass-assignment@example.com" });
		expect(saved.wishlist).toHaveLength(0);
	});

	it("never returns the password hash in the response body", async () => {
		const req = httpMocks.createRequest({
			method: "POST",
			body: { email: "hash-leak@example.com", password: "hunter22" },
		});
		const res = httpMocks.createResponse();

		await postUser(req, res);

		const body = res._getJSONData();
		expect(body.data.password).toBeUndefined();
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
