const httpMocks = require("node-mocks-http");
const dbConnect = require("../../../lib/dbConnect").default;
const userModel = require("../../../models/user.model");
const productModel = require("../../../models/product.model");
const bundleModel = require("../../../models/bundle.model");
const { createBundle } = require("../../../controllers/bundles/createBundle");

beforeAll(async () => {
	await dbConnect();
});

async function makeProduct(sellerId, extra = {}) {
	return productModel.create({
		name: "Item",
		seller: sellerId,
		condition: "good",
		pickupBuildingId: "north-hall",
		...extra,
	});
}

function callCreateBundle(body, callerUid) {
	const req = httpMocks.createRequest({ method: "POST", body });
	req.user = { uid: callerUid };
	const res = httpMocks.createResponse();
	return createBundle(req, res).then(() => res);
}

describe("createBundle", () => {
	it("creates a bundle referencing existing products and locks them from individual sale", async () => {
		const seller = await userModel.create({ email: "bundle-seller@example.edu", password: "x" });
		const item1 = await makeProduct(seller._id);
		const item2 = await makeProduct(seller._id);

		const res = await callCreateBundle(
			{ items: [item1._id.toString(), item2._id.toString()], bundlePrice: 80 },
			seller._id.toString()
		);

		expect(res.statusCode).toBe(200);
		const bundle = await bundleModel.findOne({ seller: seller._id });
		expect(bundle.items.map(String)).toEqual([item1._id.toString(), item2._id.toString()]);

		const updatedItem1 = await productModel.findOne({ _id: item1._id });
		expect(updatedItem1.bundledIn.toString()).toBe(bundle._id.toString());
	});

	it("refuses fewer than two items", async () => {
		const seller = await userModel.create({ email: "single-item@example.edu", password: "x" });
		const item1 = await makeProduct(seller._id);

		const res = await callCreateBundle(
			{ items: [item1._id.toString()], bundlePrice: 50 },
			seller._id.toString()
		);

		expect(res.statusCode).toBe(400);
	});

	it("refuses to bundle a product the caller doesn't own", async () => {
		const seller = await userModel.create({ email: "real-owner@example.edu", password: "x" });
		const attacker = await userModel.create({ email: "attacker@example.edu", password: "x" });
		const item1 = await makeProduct(seller._id);
		const item2 = await makeProduct(seller._id);

		const res = await callCreateBundle(
			{ items: [item1._id.toString(), item2._id.toString()], bundlePrice: 50 },
			attacker._id.toString()
		);

		expect(res.statusCode).toBe(403);
	});

	it("refuses to bundle a product that's already in another active bundle", async () => {
		const seller = await userModel.create({ email: "double-bundle@example.edu", password: "x" });
		const item1 = await makeProduct(seller._id);
		const item2 = await makeProduct(seller._id);
		const item3 = await makeProduct(seller._id);

		await callCreateBundle(
			{ items: [item1._id.toString(), item2._id.toString()], bundlePrice: 50 },
			seller._id.toString()
		);

		const res = await callCreateBundle(
			{ items: [item1._id.toString(), item3._id.toString()], bundlePrice: 50 },
			seller._id.toString()
		);

		expect(res.statusCode).toBe(403);
	});
});
