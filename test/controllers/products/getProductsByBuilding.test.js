const httpMocks = require("node-mocks-http");
const dbConnect = require("../../../lib/dbConnect").default;
const userModel = require("../../../models/user.model");
const productModel = require("../../../models/product.model");
const {
	getProductsByBuilding,
} = require("../../../controllers/products/getProductsByBuilding");

beforeAll(async () => {
	await dbConnect();
});

function callGetByBuilding(buildingId) {
	const req = httpMocks.createRequest({ method: "GET", query: { buildingId } });
	const res = httpMocks.createResponse();
	return getProductsByBuilding(req, res).then(() => res);
}

describe("getProductsByBuilding", () => {
	it("returns only active listings picked up at the exact building", async () => {
		const seller = await userModel.create({ email: "b1@example.edu", password: "x" });
		await productModel.create({
			name: "In North Hall",
			seller: seller._id,
			condition: "good",
			pickupBuildingId: "north-hall",
		});
		await productModel.create({
			name: "In Library",
			seller: seller._id,
			condition: "good",
			pickupBuildingId: "library",
		});

		const res = await callGetByBuilding("north-hall");

		const names = res._getJSONData().data.map((p) => p.name);
		expect(names).toEqual(["In North Hall"]);
	});

	it("rejects a building id that isn't in the fixed campus list", async () => {
		const res = await callGetByBuilding("not-a-real-building");
		expect(res.statusCode).toBe(400);
	});
});
