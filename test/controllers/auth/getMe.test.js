const httpMocks = require("node-mocks-http");
const dbConnect = require("../../../lib/dbConnect").default;
const userModel = require("../../../models/user.model");
const { getMe } = require("../../../controllers/auth/getMe");

beforeAll(async () => {
	await dbConnect();
});

describe("getMe", () => {
	it("returns the authenticated user without the password hash", async () => {
		const user = await userModel.create({
			email: "me@example.com",
			firstName: "Riya",
			password: "$2a$12$somehashvaluesomehashvalue1234567890abcd",
		});

		const req = httpMocks.createRequest({ method: "GET" });
		req.user = { uid: user._id.toString() };
		const res = httpMocks.createResponse();

		await getMe(req, res);

		const body = res._getJSONData();
		expect(body.success).toBe(true);
		expect(body.data.email).toBe("me@example.com");
		expect(body.data.password).toBeUndefined();
	});
});
