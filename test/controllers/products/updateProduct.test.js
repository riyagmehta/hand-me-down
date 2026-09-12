const httpMocks = require("node-mocks-http");
const dbConnect = require("../../../lib/dbConnect").default;
const userModel = require("../../../models/user.model");
const productModel = require("../../../models/product.model");
const { updateProduct } = require("../../../controllers/products/updateProduct");

beforeAll(async () => {
	await dbConnect();
});

async function makeProduct(sellerId, extra = {}) {
	return productModel.create({
		name: "Old Textbook",
		seller: sellerId,
		condition: "good",
		pickupBuildingId: "north-hall",
		...extra,
	});
}

describe("updateProduct", () => {
	it("lets the owning seller update their own product", async () => {
		const seller = await userModel.create({ email: "s1@example.com", password: "x" });
		const product = await makeProduct(seller._id);

		const req = httpMocks.createRequest({
			method: "PUT",
			query: { pid: product._id.toString() },
			body: { name: "Updated Title" },
		});
		req.user = { uid: seller._id.toString() };
		const res = httpMocks.createResponse();

		await updateProduct(req, res);

		expect(res.statusCode).toBe(200);
		expect(res._getJSONData().data.name).toBe("Updated Title");
	});

	it("refuses to update another seller's product (IDOR)", async () => {
		const owner = await userModel.create({ email: "s2@example.com", password: "x" });
		const attacker = await userModel.create({ email: "s3@example.com", password: "x" });
		const product = await makeProduct(owner._id);

		const req = httpMocks.createRequest({
			method: "PUT",
			query: { pid: product._id.toString() },
			body: { name: "Hijacked Title" },
		});
		req.user = { uid: attacker._id.toString() };
		const res = httpMocks.createResponse();

		await updateProduct(req, res);

		expect(res.statusCode).toBe(400);
		const stillOriginal = await productModel.findOne({ _id: product._id });
		expect(stillOriginal.name).toBe("Old Textbook");
	});

	it("lets the seller move the listing to a different campus building", async () => {
		const seller = await userModel.create({ email: "s4@example.com", password: "x" });
		const product = await makeProduct(seller._id);

		const req = httpMocks.createRequest({
			method: "PUT",
			query: { pid: product._id.toString() },
			body: { pickupBuildingId: "library" },
		});
		req.user = { uid: seller._id.toString() };
		const res = httpMocks.createResponse();

		await updateProduct(req, res);

		const updated = await productModel.findOne({ _id: product._id });
		expect(updated.pickupBuildingId).toBe("library");
	});
});
