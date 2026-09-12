const httpMocks = require("node-mocks-http");
const productsHandler = require("../../../../pages/api/products/index").default;

describe("pages/api/products (route wiring)", () => {
	it("rejects an unauthenticated POST", async () => {
		const req = httpMocks.createRequest({ method: "POST", cookies: {} });
		const res = httpMocks.createResponse();

		await productsHandler(req, res);

		expect(res.statusCode).toBe(401);
	});

	it("allows unauthenticated GET (browsing listings stays public)", async () => {
		const req = httpMocks.createRequest({
			method: "GET",
			query: {},
			cookies: {},
		});
		const res = httpMocks.createResponse();

		await productsHandler(req, res);

		expect(res.statusCode).toBe(200);
	});
});
