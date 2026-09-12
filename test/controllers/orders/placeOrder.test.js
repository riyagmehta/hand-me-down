const httpMocks = require("node-mocks-http");
const mongoose = require("mongoose");
const dbConnect = require("../../../lib/dbConnect").default;
const userModel = require("../../../models/user.model");
const productModel = require("../../../models/product.model");
const orderModel = require("../../../models/order.model");
const { placeOrder } = require("../../../controllers/orders/placeOrder");

beforeAll(async () => {
	await dbConnect();
});

async function makeSeller() {
	return userModel.create({ email: `seller-${Date.now()}-${Math.random()}@example.com`, password: "x" });
}

async function makeBuyer() {
	return userModel.create({ email: `buyer-${Date.now()}-${Math.random()}@example.com`, password: "x" });
}

async function makeProduct(sellerId, counts) {
	return productModel.create({
		name: "Bike",
		seller: sellerId,
		price: 50,
		counts,
		condition: "good",
		pickupBuildingId: "north-hall",
	});
}

function callPlaceOrder({ pid, quantity, idempotencyKey, buyerId }) {
	const req = httpMocks.createRequest({
		method: "POST",
		body: { pid, quantity, idempotencyKey },
	});
	req.user = { uid: buyerId };
	const res = httpMocks.createResponse();
	return placeOrder(req, res).then(() => res);
}

describe("placeOrder", () => {
	it("refuses to sell a product individually while it's locked in an active bundle", async () => {
		const seller = await makeSeller();
		const buyer = await makeBuyer();
		const product = await makeProduct(seller._id, 5);
		await productModel.updateOne(
			{ _id: product._id },
			{ bundledIn: new mongoose.Types.ObjectId() }
		);

		const res = await callPlaceOrder({
			pid: product._id.toString(),
			quantity: 1,
			idempotencyKey: "key-bundled",
			buyerId: buyer._id.toString(),
		});

		expect(res.statusCode).toBe(400);
		const unchanged = await productModel.findOne({ _id: product._id });
		expect(unchanged.counts).toBe(5);
	});

	it("places an order and decrements stock on the happy path", async () => {
		const seller = await makeSeller();
		const buyer = await makeBuyer();
		const product = await makeProduct(seller._id, 5);

		const res = await callPlaceOrder({
			pid: product._id.toString(),
			quantity: 2,
			idempotencyKey: "key-happy-path",
			buyerId: buyer._id.toString(),
		});

		expect(res.statusCode).toBe(200);
		const body = res._getJSONData();
		expect(body.data.totalPrice).toBe(100);

		const updatedProduct = await productModel.findOne({ _id: product._id });
		expect(updatedProduct.counts).toBe(3);
	});

	it("rejects a purchase that exceeds available stock", async () => {
		const seller = await makeSeller();
		const buyer = await makeBuyer();
		const product = await makeProduct(seller._id, 1);

		const res = await callPlaceOrder({
			pid: product._id.toString(),
			quantity: 5,
			idempotencyKey: "key-insufficient-stock",
			buyerId: buyer._id.toString(),
		});

		expect(res.statusCode).toBe(409);
		const updatedProduct = await productModel.findOne({ _id: product._id });
		expect(updatedProduct.counts).toBe(1);
	});

	it("blocks a seller from buying their own product", async () => {
		const seller = await makeSeller();
		const product = await makeProduct(seller._id, 5);

		const res = await callPlaceOrder({
			pid: product._id.toString(),
			quantity: 1,
			idempotencyKey: "key-self-purchase",
			buyerId: seller._id.toString(),
		});

		expect(res.statusCode).toBe(403);
	});

	it("returns the same order on a sequential retry with the same idempotency key instead of double-decrementing", async () => {
		const seller = await makeSeller();
		const buyer = await makeBuyer();
		const product = await makeProduct(seller._id, 5);

		const first = await callPlaceOrder({
			pid: product._id.toString(),
			quantity: 1,
			idempotencyKey: "key-retry",
			buyerId: buyer._id.toString(),
		});
		const second = await callPlaceOrder({
			pid: product._id.toString(),
			quantity: 1,
			idempotencyKey: "key-retry",
			buyerId: buyer._id.toString(),
		});

		expect(first._getJSONData().data._id).toBe(second._getJSONData().data._id);
		const orders = await orderModel.find({ idempotencyKey: "key-retry" });
		expect(orders).toHaveLength(1);
		const updatedProduct = await productModel.findOne({ _id: product._id });
		expect(updatedProduct.counts).toBe(4);
	});

	it("does not oversell the last unit under real concurrent requests", async () => {
		const seller = await makeSeller();
		const buyerA = await makeBuyer();
		const buyerB = await makeBuyer();
		const product = await makeProduct(seller._id, 1);

		const [resA, resB] = await Promise.all([
			callPlaceOrder({
				pid: product._id.toString(),
				quantity: 1,
				idempotencyKey: "concurrent-key-a",
				buyerId: buyerA._id.toString(),
			}),
			callPlaceOrder({
				pid: product._id.toString(),
				quantity: 1,
				idempotencyKey: "concurrent-key-b",
				buyerId: buyerB._id.toString(),
			}),
		]);

		const statusCodes = [resA.statusCode, resB.statusCode].sort();
		expect(statusCodes).toEqual([200, 409]);

		const updatedProduct = await productModel.findOne({ _id: product._id });
		expect(updatedProduct.counts).toBe(0);

		const orders = await orderModel.find({ product: product._id });
		expect(orders).toHaveLength(1);
	});

	it("creates exactly one order when concurrent requests share the same idempotency key", async () => {
		const seller = await makeSeller();
		const buyer = await makeBuyer();
		const product = await makeProduct(seller._id, 5);

		const [resA, resB] = await Promise.all([
			callPlaceOrder({
				pid: product._id.toString(),
				quantity: 1,
				idempotencyKey: "shared-concurrent-key",
				buyerId: buyer._id.toString(),
			}),
			callPlaceOrder({
				pid: product._id.toString(),
				quantity: 1,
				idempotencyKey: "shared-concurrent-key",
				buyerId: buyer._id.toString(),
			}),
		]);

		expect(resA.statusCode).toBe(200);
		expect(resB.statusCode).toBe(200);
		expect(resA._getJSONData().data._id).toBe(resB._getJSONData().data._id);

		const orders = await orderModel.find({ idempotencyKey: "shared-concurrent-key" });
		expect(orders).toHaveLength(1);

		const updatedProduct = await productModel.findOne({ _id: product._id });
		expect(updatedProduct.counts).toBe(4);
	});

	it("rejects invalid input (bad pid, non-integer quantity, missing idempotency key)", async () => {
		const seller = await makeSeller();
		const buyer = await makeBuyer();
		const product = await makeProduct(seller._id, 5);

		const badPid = await callPlaceOrder({
			pid: "not-an-object-id",
			quantity: 1,
			idempotencyKey: "key-bad-pid",
			buyerId: buyer._id.toString(),
		});
		expect(badPid.statusCode).toBe(400);

		const badQuantity = await callPlaceOrder({
			pid: product._id.toString(),
			quantity: 1.5,
			idempotencyKey: "key-bad-quantity",
			buyerId: buyer._id.toString(),
		});
		expect(badQuantity.statusCode).toBe(400);

		const missingKey = await callPlaceOrder({
			pid: product._id.toString(),
			quantity: 1,
			idempotencyKey: "",
			buyerId: buyer._id.toString(),
		});
		expect(missingKey.statusCode).toBe(400);
	});
});
