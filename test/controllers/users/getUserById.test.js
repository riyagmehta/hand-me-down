const httpMocks = require("node-mocks-http");
const dbConnect = require("../../../lib/dbConnect").default;
const userModel = require("../../../models/user.model");
const { getUserById } = require("../../../controllers/users/getUserById");

beforeAll(async () => {
	await dbConnect();
});

describe("getUserById", () => {
	it("never includes the password hash in the response", async () => {
		const user = await userModel.create({
			email: "e@example.com",
			password: "$2a$12$somehashvaluesomehashvalue1234567890abcd",
		});

		const req = httpMocks.createRequest({
			method: "GET",
			query: { uid: user._id.toString() },
		});
		const res = httpMocks.createResponse();

		await getUserById(req, res);

		const body = res._getJSONData();
		expect(body.data.password).toBeUndefined();
	});
});
