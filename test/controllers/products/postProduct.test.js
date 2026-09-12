const httpMocks = require("node-mocks-http");
const { EventEmitter } = require("events");
const dbConnect = require("../../../lib/dbConnect").default;
const userModel = require("../../../models/user.model");
const productModel = require("../../../models/product.model");
const { postProduct } = require("../../../controllers/products/postProduct");

beforeAll(async () => {
	await dbConnect();
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
});
