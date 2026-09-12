const httpMocks = require("node-mocks-http");
const dbConnect = require("../../../lib/dbConnect").default;
const userModel = require("../../../models/user.model");
const productModel = require("../../../models/product.model");
const { placeOrder } = require("../../../controllers/orders/placeOrder");
const { getMyOrders } = require("../../../controllers/orders/getMyOrders");

beforeAll(async () => {
	await dbConnect();
});

async function makeUser() {
	return userModel.create({ email: `u-${Date.now()}-${Math.random()}@example.com`, password: "x" });
}

async function placeTestOrder(sellerId, buyerId) {
	const product = await productModel.create({
		name: "Bike",
		seller: sellerId,
		price: 50,
		counts: 5,
		condition: "good",
		pickupBuildingId: "north-hall",
	});
	const req = httpMocks.createRequest({
		method: "POST",
		body: { pid: product._id.toString(), quantity: 1, idempotencyKey: `key-${Math.random()}` },
	});
	req.user = { uid: buyerId };
	const res = httpMocks.createResponse();
	await placeOrder(req, res);
}

function callGetMyOrders(uid) {
	const req = httpMocks.createRequest({ method: "GET" });
	req.user = { uid };
	const res = httpMocks.createResponse();
	return getMyOrders(req, res).then(() => res);
}

describe("getMyOrders", () => {
	it("returns orders where the caller is buyer or seller, with no password leaked", async () => {
		const seller = await makeUser();
		const buyer = await makeUser();
		const stranger = await makeUser();
		await placeTestOrder(seller._id.toString(), buyer._id.toString());

		const asBuyer = await callGetMyOrders(buyer._id.toString());
		const asSeller = await callGetMyOrders(seller._id.toString());
		const asStranger = await callGetMyOrders(stranger._id.toString());

		expect(asBuyer._getJSONData().data).toHaveLength(1);
		expect(asSeller._getJSONData().data).toHaveLength(1);
		expect(asStranger._getJSONData().data).toHaveLength(0);

		const order = asBuyer._getJSONData().data[0];
		expect(order.buyer.password).toBeUndefined();
		expect(order.seller.password).toBeUndefined();
		expect(order.product.name).toBe("Bike");
	});
});
