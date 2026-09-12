const httpMocks = require("node-mocks-http");
const dbConnect = require("../../../lib/dbConnect").default;
const userModel = require("../../../models/user.model");
const productModel = require("../../../models/product.model");
const { getNearbyProducts } = require("../../../controllers/products/getNearbyProducts");

beforeAll(async () => {
	await dbConnect();
});

// Near the equator, ~0.009 degrees of lat/lng is ~1km, so these offsets from
// the origin give predictable, easy-to-reason-about distances without
// depending on real-world city coordinates.
const point = (kmFromOrigin) => ({
	type: "Point",
	coordinates: [kmFromOrigin * 0.009, 0],
});

function callGetNearby(query) {
	const req = httpMocks.createRequest({ method: "GET", query });
	const res = httpMocks.createResponse();
	return getNearbyProducts(req, res).then(() => res);
}

describe("getNearbyProducts", () => {
	it("returns only products within the radius, nearest first", async () => {
		const seller = await userModel.create({ email: "geo-seller@example.com", password: "x" });
		await productModel.create({
			name: "Near Item",
			seller: seller._id,
			condition: "good",
			pickupAddress: "close by",
			location: point(2),
		});
		await productModel.create({
			name: "Mid Item",
			seller: seller._id,
			condition: "good",
			pickupAddress: "a bit further",
			location: point(8),
		});
		await productModel.create({
			name: "Far Item",
			seller: seller._id,
			condition: "good",
			pickupAddress: "far away",
			location: point(200),
		});
		await productModel.create({
			name: "No Location Item",
			seller: seller._id,
			condition: "good",
			pickupAddress: "never geocoded",
		});

		const res = await callGetNearby({ lat: "0", lng: "0", radiusKm: "10" });

		expect(res.statusCode).toBe(200);
		const names = res._getJSONData().data.map((p) => p.name);
		expect(names).toEqual(["Near Item", "Mid Item"]);
		expect(names).not.toContain("Far Item");
		expect(names).not.toContain("No Location Item");
	});

	it("defaults to a 10km radius when none is given", async () => {
		const seller = await userModel.create({ email: "geo-seller2@example.com", password: "x" });
		await productModel.create({
			name: "Within Default",
			seller: seller._id,
			condition: "good",
			pickupAddress: "close",
			location: point(5),
		});
		await productModel.create({
			name: "Outside Default",
			seller: seller._id,
			condition: "good",
			pickupAddress: "far",
			location: point(50),
		});

		const res = await callGetNearby({ lat: "0", lng: "0" });

		const names = res._getJSONData().data.map((p) => p.name);
		expect(names).toContain("Within Default");
		expect(names).not.toContain("Outside Default");
	});

	it("caps the radius at 100km even if a larger one is requested", async () => {
		const seller = await userModel.create({ email: "geo-seller3@example.com", password: "x" });
		await productModel.create({
			name: "Beyond Cap",
			seller: seller._id,
			condition: "good",
			pickupAddress: "very far",
			location: point(150),
		});

		const res = await callGetNearby({ lat: "0", lng: "0", radiusKm: "1000" });

		const names = res._getJSONData().data.map((p) => p.name);
		expect(names).not.toContain("Beyond Cap");
	});

	it("rejects invalid coordinates", async () => {
		const res = await callGetNearby({ lat: "not-a-number", lng: "0" });
		expect(res.statusCode).toBe(400);
	});

	it("rejects an out-of-range latitude", async () => {
		const res = await callGetNearby({ lat: "200", lng: "0" });
		expect(res.statusCode).toBe(400);
	});
});
