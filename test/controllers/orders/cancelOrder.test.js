const httpMocks = require("node-mocks-http");
const dbConnect = require("../../../lib/dbConnect").default;
const userModel = require("../../../models/user.model");
const productModel = require("../../../models/product.model");
const orderModel = require("../../../models/order.model");
const { placeOrder } = require("../../../controllers/orders/placeOrder");
const { cancelOrder } = require("../../../controllers/orders/cancelOrder");

beforeAll(async () => {
	await dbConnect();
});

async function makeUser() {
	return userModel.create({ email: `u-${Date.now()}-${Math.random()}@example.com`, password: "x" });
}

async function placeTestOrder({ sellerId, buyerId, counts = 5, quantity = 1 }) {
	const product = await productModel.create({
		name: "Bike",
		seller: sellerId,
		price: 50,
		counts,
		condition: "good",
		pickupAddress: "1 St",
	});

	const req = httpMocks.createRequest({
		method: "POST",
		body: { pid: product._id.toString(), quantity, idempotencyKey: `key-${Math.random()}` },
	});
	req.user = { uid: buyerId };
	const res = httpMocks.createResponse();
	await placeOrder(req, res);
	const order = res._getJSONData().data;
	return { product, order };
}

function callCancelOrder(orderId, callerUid) {
	const req = httpMocks.createRequest({ method: "PUT", query: { oid: orderId } });
	req.user = { uid: callerUid };
	const res = httpMocks.createResponse();
	return cancelOrder(req, res).then(() => res);
}

describe("cancelOrder", () => {
	it("lets the buyer cancel and restocks the product", async () => {
		const seller = await makeUser();
		const buyer = await makeUser();
		const { product, order } = await placeTestOrder({
			sellerId: seller._id.toString(),
			buyerId: buyer._id.toString(),
			counts: 5,
			quantity: 2,
		});

		const res = await callCancelOrder(order._id, buyer._id.toString());

		expect(res.statusCode).toBe(200);
		const body = res._getJSONData().data;
		expect(body.status).toBe("cancelled");
		// Populated the same way as getMyOrders, so the frontend can merge
		// the cancel response straight into its order list without losing
		// the product/buyer/seller details it already had.
		expect(body.product.name).toBe("Bike");
		expect(body.buyer.email).toBe(buyer.email);
		const restocked = await productModel.findOne({ _id: product._id });
		expect(restocked.counts).toBe(5);
	});

	it("lets the seller cancel too", async () => {
		const seller = await makeUser();
		const buyer = await makeUser();
		const { order } = await placeTestOrder({
			sellerId: seller._id.toString(),
			buyerId: buyer._id.toString(),
		});

		const res = await callCancelOrder(order._id, seller._id.toString());
		expect(res.statusCode).toBe(200);
	});

	it("refuses to let an unrelated user cancel someone else's order", async () => {
		const seller = await makeUser();
		const buyer = await makeUser();
		const stranger = await makeUser();
		const { product, order } = await placeTestOrder({
			sellerId: seller._id.toString(),
			buyerId: buyer._id.toString(),
		});

		const res = await callCancelOrder(order._id, stranger._id.toString());

		expect(res.statusCode).toBe(400);
		const stillPlaced = await orderModel.findOne({ _id: order._id });
		expect(stillPlaced.status).toBe("placed");
		const unchangedProduct = await productModel.findOne({ _id: product._id });
		expect(unchangedProduct.counts).toBe(4);
	});

	it("refuses to cancel an order that is already cancelled", async () => {
		const seller = await makeUser();
		const buyer = await makeUser();
		const { order } = await placeTestOrder({
			sellerId: seller._id.toString(),
			buyerId: buyer._id.toString(),
		});

		await callCancelOrder(order._id, buyer._id.toString());
		const second = await callCancelOrder(order._id, buyer._id.toString());

		expect(second.statusCode).toBe(400);
	});

	it("only restocks once when two cancel requests race on the same order", async () => {
		const seller = await makeUser();
		const buyer = await makeUser();
		const { product, order } = await placeTestOrder({
			sellerId: seller._id.toString(),
			buyerId: buyer._id.toString(),
			counts: 5,
			quantity: 2,
		});

		const [resA, resB] = await Promise.all([
			callCancelOrder(order._id, buyer._id.toString()),
			callCancelOrder(order._id, buyer._id.toString()),
		]);

		const statusCodes = [resA.statusCode, resB.statusCode].sort();
		expect(statusCodes).toEqual([200, 400]);

		const restocked = await productModel.findOne({ _id: product._id });
		expect(restocked.counts).toBe(5);
	});
});
