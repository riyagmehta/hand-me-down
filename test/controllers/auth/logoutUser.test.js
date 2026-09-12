const httpMocks = require("node-mocks-http");
const { logoutUser } = require("../../../controllers/auth/logoutUser");

describe("logoutUser", () => {
	it("clears the token, email, and name cookies", async () => {
		const req = httpMocks.createRequest({ method: "POST" });
		const res = httpMocks.createResponse();

		await logoutUser(req, res);

		expect(res.statusCode).toBe(200);
		const setCookieHeaders = res.getHeader("Set-Cookie");
		const cleared = setCookieHeaders.map((c) => c.split("=")[0]);
		expect(cleared).toEqual(expect.arrayContaining(["token", "email", "name"]));
		setCookieHeaders.forEach((cookie) => {
			expect(cookie.toLowerCase()).toMatch(/max-age=-1/);
		});
	});
});
