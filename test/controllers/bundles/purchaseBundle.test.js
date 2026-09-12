const httpMocks = require("node-mocks-http");
const dbConnect = require("../../../lib/dbConnect").default;
const userModel = require("../../../models/user.model");
const productModel = require("../../../models/product.model");
const bundleModel = require("../../../models/bundle.model");
const orderModel = require("../../../models/order.model");
const { createBundle } = require("../../../controllers/bundles/createBundle");
const { purchaseBundle } = require("../../../controllers/bundles/purchaseBundle");

beforeAll(async () => {
	await dbConnect();
});

async function makeBundle(sellerId, itemCounts) {
	const items = await Promise.all(
		itemCounts.map((counts, i) =>
			productModel.create({
				name: `Item ${i}`,
				seller: sellerId,
				condition: "good",
				pickupBuildingId: "north-hall",
				counts,
			})
		)
	);

	const req = httpMocks.createRequest({
		method: "POST",
		body: { items: items.map((p) => p._id.toString()), bundlePrice: 80 },
	});
	req.user = { uid: sellerId.toString() };
	const res = httpMocks.createResponse();
	await createBundle(req, res);
	return { bundle: res._getJSONData().data, items };
}

function callPurchaseBundle({ bundleId, idempotencyKey, buyerId }) {
	const req = httpMocks.createRequest({
		method: "POST",
		body: { bundleId, idempotencyKey },
	});
	req.user = { uid: buyerId };
	const res = httpMocks.createResponse();
	return purchaseBundle(req, res).then(() => res);
}

describe("purchaseBundle", () => {
	it("decrements every item in the bundle on success", async () => {
		const seller = await userModel.create({ email: "seller1@example.edu", password: "x" });
		const buyer = await userModel.create({ email: "buyer1@example.edu", password: "x" });
		const { bundle, items } = await makeBundle(seller._id, [3, 3]);

		const res = await callPurchaseBundle({
			bundleId: bundle._id,
			idempotencyKey: "bundle-key-1",
			buyerId: buyer._id.toString(),
		});

		expect(res.statusCode).toBe(200);
		expect(res._getJSONData().data.totalPrice).toBe(80);
		for (const item of items) {
			const updated = await productModel.findOne({ _id: item._id });
			expect(updated.counts).toBe(2);
		}
		const updatedBundle = await bundleModel.findOne({ _id: bundle._id });
		expect(updatedBundle.status).toBe("sold");
	});

	it("rolls back every already-reserved item when a later item in the bundle is out of stock", async () => {
		const seller = await userModel.create({ email: "seller2@example.edu", password: "x" });
		const buyer = await userModel.create({ email: "buyer2@example.edu", password: "x" });
		// Second item has 0 stock -- the saga should reserve the first item,
		// fail on the second, and give the first item's stock back.
		const { bundle, items } = await makeBundle(seller._id, [3, 0]);

		const res = await callPurchaseBundle({
			bundleId: bundle._id,
			idempotencyKey: "bundle-key-2",
			buyerId: buyer._id.toString(),
		});

		expect(res.statusCode).toBe(409);
		const firstItem = await productModel.findOne({ _id: items[0]._id });
		expect(firstItem.counts).toBe(3); // rolled back, not left at 2
		const secondItem = await productModel.findOne({ _id: items[1]._id });
		expect(secondItem.counts).toBe(0);
		const orders = await orderModel.find({ bundle: bundle._id });
		expect(orders).toHaveLength(0);
		const updatedBundle = await bundleModel.findOne({ _id: bundle._id });
		expect(updatedBundle.status).toBe("active");
	});

	it("blocks a seller from buying their own bundle", async () => {
		const seller = await userModel.create({ email: "seller3@example.edu", password: "x" });
		const { bundle } = await makeBundle(seller._id, [3, 3]);

		const res = await callPurchaseBundle({
			bundleId: bundle._id,
			idempotencyKey: "bundle-key-3",
			buyerId: seller._id.toString(),
		});

		expect(res.statusCode).toBe(403);
	});

	it("does not oversell a shared item when two buyers race the same bundle", async () => {
		const seller = await userModel.create({ email: "seller4@example.edu", password: "x" });
		const buyerA = await userModel.create({ email: "buyerA@example.edu", password: "x" });
		const buyerB = await userModel.create({ email: "buyerB@example.edu", password: "x" });
		// counts:1 on each item -- only one full saga can succeed.
		const { bundle, items } = await makeBundle(seller._id, [1, 1]);

		const [resA, resB] = await Promise.all([
			callPurchaseBundle({
				bundleId: bundle._id,
				idempotencyKey: "race-key-a",
				buyerId: buyerA._id.toString(),
			}),
			callPurchaseBundle({
				bundleId: bundle._id,
				idempotencyKey: "race-key-b",
				buyerId: buyerB._id.toString(),
			}),
		]);

		const statusCodes = [resA.statusCode, resB.statusCode].sort();
		expect(statusCodes).toEqual([200, 409]);

		for (const item of items) {
			const updated = await productModel.findOne({ _id: item._id });
			expect(updated.counts).toBe(0);
		}
		const orders = await orderModel.find({ bundle: bundle._id });
		expect(orders).toHaveLength(1);
	});

	it("returns the same order on a retried request with the same idempotency key", async () => {
		const seller = await userModel.create({ email: "seller5@example.edu", password: "x" });
		const buyer = await userModel.create({ email: "buyer5@example.edu", password: "x" });
		const { bundle, items } = await makeBundle(seller._id, [3, 3]);

		const first = await callPurchaseBundle({
			bundleId: bundle._id,
			idempotencyKey: "retry-key",
			buyerId: buyer._id.toString(),
		});
		const second = await callPurchaseBundle({
			bundleId: bundle._id,
			idempotencyKey: "retry-key",
			buyerId: buyer._id.toString(),
		});

		expect(first._getJSONData().data._id).toBe(second._getJSONData().data._id);
		for (const item of items) {
			const updated = await productModel.findOne({ _id: item._id });
			expect(updated.counts).toBe(2); // decremented once, not twice
		}
	});
});
