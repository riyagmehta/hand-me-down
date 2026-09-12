const httpMocks = require("node-mocks-http");
const dbConnect = require("../../../../lib/dbConnect").default;
const userModel = require("../../../../models/user.model");
const productModel = require("../../../../models/product.model");
const { addToWishList } = require("../../../../controllers/users/wishlist/addToWishList");
const { getWishList } = require("../../../../controllers/users/wishlist/getWishlist");
const {
	removeFromWishList,
} = require("../../../../controllers/users/wishlist/removeFromWishlist");

beforeAll(async () => {
	await dbConnect();
});

describe("wishlist ownership", () => {
	it("addToWishList mutates the authenticated user's wishlist, not a uid from the query string", async () => {
		const victim = await userModel.create({ email: "victim@example.com", password: "x" });
		const attacker = await userModel.create({ email: "atk@example.com", password: "x" });
		const seller = await userModel.create({ email: "s@example.com", password: "x" });
		const product = await productModel.create({
			name: "Jacket",
			seller: seller._id,
			condition: "good",
			pickupAddress: "1 St",
		});

		const req = httpMocks.createRequest({
			method: "PUT",
			query: { uid: victim._id.toString() },
			body: { pid: product._id.toString() },
		});
		req.user = { uid: attacker._id.toString() };
		const res = httpMocks.createResponse();

		await addToWishList(req, res);

		const victimAfter = await userModel.findOne({ _id: victim._id });
		const attackerAfter = await userModel.findOne({ _id: attacker._id });
		expect(victimAfter.wishlist).toHaveLength(0);
		expect(attackerAfter.wishlist.map(String)).toContain(product._id.toString());
	});

	it("getWishList returns the caller's own wishlist regardless of the uid in the query string", async () => {
		const victim = await userModel.create({ email: "victim2@example.com", password: "x" });
		const caller = await userModel.create({ email: "caller@example.com", password: "x" });

		const req = httpMocks.createRequest({
			method: "GET",
			query: { uid: victim._id.toString() },
		});
		req.user = { uid: caller._id.toString() };
		const res = httpMocks.createResponse();

		await getWishList(req, res);

		expect(res.statusCode).toBe(200);
		expect(res._getJSONData().data).toEqual([]);
	});

	it("removeFromWishList only ever removes from the authenticated user's own wishlist", async () => {
		const seller = await userModel.create({ email: "s2@example.com", password: "x" });
		const product = await productModel.create({
			name: "Shoes",
			seller: seller._id,
			condition: "good",
			pickupAddress: "1 St",
		});
		const victim = await userModel.create({
			email: "victim3@example.com",
			password: "x",
			wishlist: [product._id],
		});
		const attacker = await userModel.create({ email: "atk2@example.com", password: "x" });

		const req = httpMocks.createRequest({
			method: "PUT",
			query: { uid: victim._id.toString() },
			body: { pid: product._id.toString() },
		});
		req.user = { uid: attacker._id.toString() };
		const res = httpMocks.createResponse();

		await removeFromWishList(req, res);

		const victimAfter = await userModel.findOne({ _id: victim._id });
		expect(victimAfter.wishlist.map(String)).toContain(product._id.toString());
	});
});
