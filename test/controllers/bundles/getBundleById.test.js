const httpMocks = require("node-mocks-http");
const dbConnect = require("../../../lib/dbConnect").default;
const userModel = require("../../../models/user.model");
const productModel = require("../../../models/product.model");
const { createBundle } = require("../../../controllers/bundles/createBundle");
const { getBundleById } = require("../../../controllers/bundles/getBundleById");

beforeAll(async () => {
	await dbConnect();
});

function callGetBundle(bid) {
	const req = httpMocks.createRequest({ method: "GET", query: { bid } });
	const res = httpMocks.createResponse();
	return getBundleById(req, res).then(() => res);
}

describe("getBundleById", () => {
	it("returns the bundle with its items and seller populated, no password leaked", async () => {
		const seller = await userModel.create({ email: "getbundle@example.edu", password: "x" });
		const item1 = await productModel.create({
			name: "Desk",
			seller: seller._id,
			condition: "good",
			pickupAddress: "Hall A",
		});
		const item2 = await productModel.create({
			name: "Chair",
			seller: seller._id,
			condition: "good",
			pickupAddress: "Hall A",
		});
		const createReq = httpMocks.createRequest({
			method: "POST",
			body: { items: [item1._id.toString(), item2._id.toString()], bundlePrice: 100 },
		});
		createReq.user = { uid: seller._id.toString() };
		const createRes = httpMocks.createResponse();
		await createBundle(createReq, createRes);
		const bundleId = createRes._getJSONData().data._id;

		const res = await callGetBundle(bundleId);

		expect(res.statusCode).toBe(200);
		const body = res._getJSONData().data;
		expect(body.items.map((i) => i.name).sort()).toEqual(["Chair", "Desk"]);
		expect(body.seller.password).toBeUndefined();
	});

	it("returns 400 for a bundle that doesn't exist", async () => {
		const res = await callGetBundle("000000000000000000000000");
		expect(res.statusCode).toBe(400);
	});
});
