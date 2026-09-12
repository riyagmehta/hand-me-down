const httpMocks = require("node-mocks-http");
const dbConnect = require("../../../lib/dbConnect").default;
const userModel = require("../../../models/user.model");
const productModel = require("../../../models/product.model");
const {
	getProductsWithFilter,
} = require("../../../controllers/products/getProductsWithFilter");

beforeAll(async () => {
	await dbConnect();
});

function callGetProducts(query = {}) {
	const req = httpMocks.createRequest({ method: "GET", query });
	const res = httpMocks.createResponse();
	return getProductsWithFilter(req, res).then(() => res);
}

describe("getProductsWithFilter", () => {
	it("excludes archived listings from the default browse", async () => {
		const seller = await userModel.create({ email: "seller@example.edu", password: "x" });
		await productModel.create({
			name: "Active Desk",
			seller: seller._id,
			condition: "good",
			pickupAddress: "Hall A",
			status: "active",
		});
		await productModel.create({
			name: "Archived Chair",
			seller: seller._id,
			condition: "good",
			pickupAddress: "Hall A",
			status: "archived",
		});

		const res = await callGetProducts();

		const names = res._getJSONData().data.map((p) => p.name);
		expect(names).toContain("Active Desk");
		expect(names).not.toContain("Archived Chair");
	});
});
