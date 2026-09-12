const httpMocks = require("node-mocks-http");
const { EventEmitter } = require("events");
const dbConnect = require("../../../lib/dbConnect").default;
const userModel = require("../../../models/user.model");
const productModel = require("../../../models/product.model");
const { postProduct } = require("../../../controllers/products/postProduct");

jest.mock("../../../lib/geocode");
const { geocodeToGeoJSON } = require("../../../lib/geocode");

jest.mock("../../../lib/textbookLookup");
const { lookupTextbookByISBN } = require("../../../lib/textbookLookup");

beforeAll(async () => {
	await dbConnect();
});

beforeEach(() => {
	geocodeToGeoJSON.mockResolvedValue({ type: "Point", coordinates: [77.5946, 12.9716] });
	lookupTextbookByISBN.mockReset();
});

function buildMultipartBody(boundary, productJSON) {
	return (
		`--${boundary}\r\n` +
		'Content-Disposition: form-data; name="product"\r\n\r\n' +
		`${JSON.stringify(productJSON)}\r\n` +
		`--${boundary}--\r\n`
	);
}

function postProductWithFields(productJSON, callerUid) {
	const boundary = "----testboundary123";
	const body = buildMultipartBody(boundary, productJSON);

	const req = httpMocks.createRequest({
		method: "POST",
		headers: {
			"content-type": `multipart/form-data; boundary=${boundary}`,
			"content-length": Buffer.byteLength(body),
		},
	});
	req.user = { uid: callerUid };
	const res = httpMocks.createResponse({ eventEmitter: EventEmitter });

	const done = new Promise((resolve) => res.on("end", resolve));
	postProduct(req, res);
	req.send(body);

	return done.then(() => res);
}

describe("postProduct", () => {
	it("sets seller from the authenticated caller, ignoring any seller in the request body", async () => {
		const realSeller = await userModel.create({ email: "real@example.com", password: "x" });
		const impersonatedSeller = await userModel.create({
			email: "impersonated@example.com",
			password: "x",
		});

		const res = await postProductWithFields(
			{
				name: "Bike",
				condition: "good",
				pickupAddress: "1 Main St",
				seller: impersonatedSeller._id.toString(),
			},
			realSeller._id.toString()
		);

		expect(res.statusCode).toBe(200);
		const saved = await productModel.findOne({ name: "Bike" });
		expect(saved.seller.toString()).toBe(realSeller._id.toString());
	});

	it("stores the geocoded location for the pickup address", async () => {
		const seller = await userModel.create({ email: "geo-seller@example.com", password: "x" });

		await postProductWithFields(
			{ name: "Desk", condition: "good", pickupAddress: "MG Road, Bangalore" },
			seller._id.toString()
		);

		expect(geocodeToGeoJSON).toHaveBeenCalledWith("MG Road, Bangalore");
		const saved = await productModel.findOne({ name: "Desk" });
		expect(saved.location.coordinates).toEqual([77.5946, 12.9716]);
	});

	it("still saves the product when geocoding fails to resolve an address", async () => {
		geocodeToGeoJSON.mockResolvedValue(undefined);
		const seller = await userModel.create({ email: "geo-fail@example.com", password: "x" });

		const res = await postProductWithFields(
			{ name: "Chair", condition: "good", pickupAddress: "somewhere unresolvable" },
			seller._id.toString()
		);

		expect(res.statusCode).toBe(200);
		const saved = await productModel.findOne({ name: "Chair" });
		expect(saved.location).toBeUndefined();
	});

	it("auto-fills textbook title/author from an ISBN lookup", async () => {
		lookupTextbookByISBN.mockResolvedValue({
			isbn: "9780132350884",
			title: "Clean Code",
			author: "Robert C. Martin",
			edition: undefined,
		});
		const seller = await userModel.create({ email: "textbook-seller@example.com", password: "x" });

		await postProductWithFields(
			{
				name: "CS textbook",
				condition: "good",
				pickupAddress: "1 Main St",
				textbookDetails: { isbn: "9780132350884", courseCode: "CS 101" },
			},
			seller._id.toString()
		);

		expect(lookupTextbookByISBN).toHaveBeenCalledWith("9780132350884");
		const saved = await productModel.findOne({ name: "CS textbook" });
		expect(saved.textbookDetails.title).toBe("Clean Code");
		expect(saved.textbookDetails.author).toBe("Robert C. Martin");
		expect(saved.textbookDetails.courseCode).toBe("CS 101");
	});

	it("keeps manually-entered title/author when the ISBN lookup fails", async () => {
		lookupTextbookByISBN.mockResolvedValue(null);
		const seller = await userModel.create({ email: "textbook-seller2@example.com", password: "x" });

		await postProductWithFields(
			{
				name: "Obscure textbook",
				condition: "good",
				pickupAddress: "1 Main St",
				textbookDetails: {
					isbn: "0000000000",
					title: "Manually Entered Title",
					courseCode: "MATH 201",
				},
			},
			seller._id.toString()
		);

		const saved = await productModel.findOne({ name: "Obscure textbook" });
		expect(saved.textbookDetails.title).toBe("Manually Entered Title");
		expect(saved.textbookDetails.courseCode).toBe("MATH 201");
	});

	it("does not attempt a lookup for a non-textbook listing", async () => {
		const seller = await userModel.create({ email: "no-textbook@example.com", password: "x" });

		await postProductWithFields(
			{ name: "Dorm Lamp", condition: "good", pickupAddress: "1 Main St" },
			seller._id.toString()
		);

		expect(lookupTextbookByISBN).not.toHaveBeenCalled();
		const saved = await productModel.findOne({ name: "Dorm Lamp" });
		expect(saved.textbookDetails).toBeUndefined();
	});
});
