const httpMocks = require("node-mocks-http");
const dbConnect = require("../../../lib/dbConnect").default;
const userModel = require("../../../models/user.model");
const productModel = require("../../../models/product.model");
const { updateProduct } = require("../../../controllers/products/updateProduct");

jest.mock("../../../lib/geocode");
const { geocodeToGeoJSON } = require("../../../lib/geocode");

beforeAll(async () => {
	await dbConnect();
});

beforeEach(() => {
	geocodeToGeoJSON.mockReset();
});

async function makeProduct(sellerId, extra = {}) {
	return productModel.create({
		name: "Old Textbook",
		seller: sellerId,
		condition: "good",
		pickupAddress: "123 Main St",
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
		expect(geocodeToGeoJSON).not.toHaveBeenCalled();
	});

	it("re-geocodes when the pickup address changes", async () => {
		geocodeToGeoJSON.mockResolvedValue({ type: "Point", coordinates: [77.5946, 12.9716] });
		const seller = await userModel.create({ email: "geo1@example.com", password: "x" });
		const product = await makeProduct(seller._id);

		const req = httpMocks.createRequest({
			method: "PUT",
			query: { pid: product._id.toString() },
			body: { pickupAddress: "MG Road, Bangalore" },
		});
		req.user = { uid: seller._id.toString() };
		const res = httpMocks.createResponse();

		await updateProduct(req, res);

		expect(geocodeToGeoJSON).toHaveBeenCalledWith("MG Road, Bangalore");
		const updated = await productModel.findOne({ _id: product._id });
		expect(updated.location.coordinates).toEqual([77.5946, 12.9716]);
	});

	it("keeps the previous location if re-geocoding the new address fails", async () => {
		const seller = await userModel.create({ email: "geo2@example.com", password: "x" });
		const product = await makeProduct(seller._id, {
			location: { type: "Point", coordinates: [1, 2] },
		});
		geocodeToGeoJSON.mockResolvedValue(undefined);

		const req = httpMocks.createRequest({
			method: "PUT",
			query: { pid: product._id.toString() },
			body: { pickupAddress: "somewhere unresolvable" },
		});
		req.user = { uid: seller._id.toString() };
		const res = httpMocks.createResponse();

		await updateProduct(req, res);

		const updated = await productModel.findOne({ _id: product._id });
		expect(updated.location.coordinates).toEqual([1, 2]);
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
});
