const httpMocks = require("node-mocks-http");
const dbConnect = require("../../../lib/dbConnect").default;
const userModel = require("../../../models/user.model");
const { updateUser } = require("../../../controllers/users/updateUser");

beforeAll(async () => {
	await dbConnect();
});

describe("updateUser", () => {
	it("refuses to update a profile that isn't the caller's own", async () => {
		const owner = await userModel.create({
			email: "owner@example.com",
			password: "hashed",
			firstName: "Original",
		});
		const attacker = await userModel.create({
			email: "attacker@example.com",
			password: "hashed",
		});

		const req = httpMocks.createRequest({
			method: "PUT",
			query: { uid: owner._id.toString() },
		});
		req.user = { uid: attacker._id.toString() };
		const res = httpMocks.createResponse();

		await updateUser(req, res);

		expect(res.statusCode).toBe(403);
		const stillOriginal = await userModel.findOne({ _id: owner._id });
		expect(stillOriginal.firstName).toBe("Original");
	});
});
