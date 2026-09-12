const httpMocks = require("node-mocks-http");
const dbConnect = require("../../../lib/dbConnect").default;
const userModel = require("../../../models/user.model");
const productModel = require("../../../models/product.model");
const {
	archiveExpiredListings,
} = require("../../../controllers/products/archiveExpiredListings");

beforeAll(async () => {
	await dbConnect();
	process.env.CRON_SECRET = "test-cron-secret";
});

function callArchive(authHeader) {
	const req = httpMocks.createRequest({
		method: "GET",
		headers: authHeader ? { authorization: authHeader } : {},
	});
	const res = httpMocks.createResponse();
	return archiveExpiredListings(req, res).then(() => res);
}

describe("archiveExpiredListings", () => {
	it("rejects a request without the correct cron secret", async () => {
		const res = await callArchive("Bearer wrong-secret");
		expect(res.statusCode).toBe(401);
	});

	it("rejects a request with no secret at all", async () => {
		const res = await callArchive(undefined);
		expect(res.statusCode).toBe(401);
	});

	it("archives only active listings past their expiry, leaving others untouched", async () => {
		const seller = await userModel.create({ email: "cron-seller@example.edu", password: "x" });
		const expired = await productModel.create({
			name: "Expired Desk",
			seller: seller._id,
			condition: "good",
			pickupAddress: "Hall A",
			status: "active",
			listingExpiresAt: new Date(Date.now() - 1000),
		});
		const notYetExpired = await productModel.create({
			name: "Still Valid Chair",
			seller: seller._id,
			condition: "good",
			pickupAddress: "Hall A",
			status: "active",
			listingExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
		});
		const alreadyArchived = await productModel.create({
			name: "Already Archived Lamp",
			seller: seller._id,
			condition: "good",
			pickupAddress: "Hall A",
			status: "archived",
			listingExpiresAt: new Date(Date.now() - 1000),
		});
		const noExpiry = await productModel.create({
			name: "No Expiry Set Rug",
			seller: seller._id,
			condition: "good",
			pickupAddress: "Hall A",
			status: "active",
		});

		const res = await callArchive("Bearer test-cron-secret");

		expect(res.statusCode).toBe(200);
		expect(res._getJSONData().data.archivedCount).toBe(1);

		expect((await productModel.findOne({ _id: expired._id })).status).toBe("archived");
		expect((await productModel.findOne({ _id: notYetExpired._id })).status).toBe("active");
		expect((await productModel.findOne({ _id: alreadyArchived._id })).status).toBe(
			"archived"
		);
		expect((await productModel.findOne({ _id: noExpiry._id })).status).toBe("active");
	});
});
