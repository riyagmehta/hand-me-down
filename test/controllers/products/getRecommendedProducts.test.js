const httpMocks = require("node-mocks-http");
const dbConnect = require("../../../lib/dbConnect").default;
const userModel = require("../../../models/user.model");
const productModel = require("../../../models/product.model");
const {
	getRecommendedProducts,
} = require("../../../controllers/products/getRecommendedProducts");

beforeAll(async () => {
	await dbConnect();
});

function callGetRecommended(viewerUid) {
	const req = httpMocks.createRequest({ method: "GET" });
	req.user = { uid: viewerUid };
	const res = httpMocks.createResponse();
	return getRecommendedProducts(req, res).then(() => res);
}

describe("getRecommendedProducts", () => {
	it("ranks a listing matching the viewer's course above an unrelated one", async () => {
		const viewer = await userModel.create({
			email: "junior@example.edu",
			password: "x",
			major: "Computer Science",
			courses: ["CS 301"],
		});
		const seller = await userModel.create({ email: "senior@example.edu", password: "x" });
		await productModel.create({
			name: "CS Textbook",
			seller: seller._id,
			condition: "good",
			pickupAddress: "Hall A",
			textbookDetails: { courseCode: "CS 301" },
		});
		await productModel.create({
			name: "Random Lamp",
			seller: seller._id,
			condition: "good",
			pickupAddress: "Hall A",
		});

		const res = await callGetRecommended(viewer._id.toString());

		const names = res._getJSONData().data.map((p) => p.name);
		expect(names[0]).toBe("CS Textbook");
	});

	it("excludes the viewer's own listings", async () => {
		const viewer = await userModel.create({ email: "self@example.edu", password: "x" });
		await productModel.create({
			name: "My Own Item",
			seller: viewer._id,
			condition: "good",
			pickupAddress: "Hall A",
		});

		const res = await callGetRecommended(viewer._id.toString());

		const names = res._getJSONData().data.map((p) => p.name);
		expect(names).not.toContain("My Own Item");
	});

	it("excludes items locked in an active bundle", async () => {
		const viewer = await userModel.create({ email: "viewer2@example.edu", password: "x" });
		const seller = await userModel.create({ email: "seller2@example.edu", password: "x" });
		const bundledItem = await productModel.create({
			name: "Bundled Desk",
			seller: seller._id,
			condition: "good",
			pickupAddress: "Hall A",
		});
		await productModel.updateOne(
			{ _id: bundledItem._id },
			{ bundledIn: seller._id } // any non-null id; only presence matters here
		);

		const res = await callGetRecommended(viewer._id.toString());

		const names = res._getJSONData().data.map((p) => p.name);
		expect(names).not.toContain("Bundled Desk");
	});

	it("still returns a sensible feed for a viewer with no major/courses set", async () => {
		const viewer = await userModel.create({ email: "no-tags@example.edu", password: "x" });
		const seller = await userModel.create({ email: "seller3@example.edu", password: "x" });
		await productModel.create({
			name: "Generic Item",
			seller: seller._id,
			condition: "good",
			pickupAddress: "Hall A",
		});

		const res = await callGetRecommended(viewer._id.toString());

		expect(res.statusCode).toBe(200);
		const names = res._getJSONData().data.map((p) => p.name);
		expect(names).toContain("Generic Item");
	});
});
