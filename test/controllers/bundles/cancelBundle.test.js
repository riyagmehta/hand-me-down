const httpMocks = require("node-mocks-http");
const dbConnect = require("../../../lib/dbConnect").default;
const userModel = require("../../../models/user.model");
const productModel = require("../../../models/product.model");
const bundleModel = require("../../../models/bundle.model");
const { createBundle } = require("../../../controllers/bundles/createBundle");
const { cancelBundle } = require("../../../controllers/bundles/cancelBundle");

beforeAll(async () => {
	await dbConnect();
});

async function makeBundle(sellerId) {
	const item1 = await productModel.create({
		name: "Item 1",
		seller: sellerId,
		condition: "good",
		pickupAddress: "Hall A",
	});
	const item2 = await productModel.create({
		name: "Item 2",
		seller: sellerId,
		condition: "good",
		pickupAddress: "Hall A",
	});

	const req = httpMocks.createRequest({
		method: "POST",
		body: { items: [item1._id.toString(), item2._id.toString()], bundlePrice: 80 },
	});
	req.user = { uid: sellerId.toString() };
	const res = httpMocks.createResponse();
	await createBundle(req, res);
	const bundle = res._getJSONData().data;
	return { bundle, item1, item2 };
}

function callCancelBundle(bundleId, callerUid) {
	const req = httpMocks.createRequest({ method: "PUT", query: { bid: bundleId } });
	req.user = { uid: callerUid };
	const res = httpMocks.createResponse();
	return cancelBundle(req, res).then(() => res);
}

describe("cancelBundle", () => {
	it("cancels the bundle and frees its items for individual sale again", async () => {
		const seller = await userModel.create({ email: "cancel-seller@example.edu", password: "x" });
		const { bundle, item1 } = await makeBundle(seller._id);

		const res = await callCancelBundle(bundle._id, seller._id.toString());

		expect(res.statusCode).toBe(200);
		const updatedItem1 = await productModel.findOne({ _id: item1._id });
		expect(updatedItem1.bundledIn).toBeNull();
	});

	it("refuses to let a non-owner cancel someone else's bundle", async () => {
		const seller = await userModel.create({ email: "owner2@example.edu", password: "x" });
		const attacker = await userModel.create({ email: "attacker2@example.edu", password: "x" });
		const { bundle } = await makeBundle(seller._id);

		const res = await callCancelBundle(bundle._id, attacker._id.toString());

		expect(res.statusCode).toBe(400);
		const stillActive = await bundleModel.findOne({ _id: bundle._id });
		expect(stillActive.status).toBe("active");
	});
});
