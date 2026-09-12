const httpMocks = require("node-mocks-http");
const dbConnect = require("../../../lib/dbConnect").default;
const userModel = require("../../../models/user.model");
const productModel = require("../../../models/product.model");
const { getProductById } = require("../../../controllers/products/getProductById");

beforeAll(async () => {
	await dbConnect();
});

describe("getProductById", () => {
	it("never includes the seller's password hash in the response", async () => {
		const seller = await userModel.create({
			email: "seller@example.com",
			password: "$2a$12$somehashvaluesomehashvalue1234567890abcd",
		});
		const product = await productModel.create({
			name: "Old Textbook",
			seller: seller._id,
			condition: "good",
			pickupBuildingId: "north-hall",
		});

		const req = httpMocks.createRequest({
			method: "GET",
			query: { pid: product._id.toString() },
		});
		const res = httpMocks.createResponse();

		await getProductById(req, res);

		const body = res._getJSONData();
		expect(body.data.seller.password).toBeUndefined();
	});
});
