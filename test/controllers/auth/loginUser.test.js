const httpMocks = require("node-mocks-http");
const jwt = require("jsonwebtoken");
const dbConnect = require("../../../lib/dbConnect").default;
const userModel = require("../../../models/user.model");
const { postUser } = require("../../../controllers/users/postUser");
const { loginUser } = require("../../../controllers/auth/loginUser");

beforeAll(async () => {
	await dbConnect();
	process.env.JWT_SECRETS = "test-jwt-secret";
});

async function registerUser(email, password) {
	const req = httpMocks.createRequest({ method: "POST", body: { email, password } });
	const res = httpMocks.createResponse();
	await postUser(req, res);
}

describe("loginUser", () => {
	it("logs in with the correct email/password and issues a verifiable token", async () => {
		await registerUser("c@example.com", "hunter22");

		const req = httpMocks.createRequest({
			method: "POST",
			body: { email: "c@example.com", password: "hunter22" },
		});
		const res = httpMocks.createResponse();

		await loginUser(req, res);

		expect(res.statusCode).toBe(200);
		const setCookieHeaders = res.getHeader("Set-Cookie");
		const tokenCookie = setCookieHeaders.find((c) => c.startsWith("token="));
		const token = decodeURIComponent(tokenCookie.split(";")[0].split("=")[1]);
		expect(() => jwt.verify(token, "test-jwt-secret")).not.toThrow();
	});

	it("sets the token cookie as httpOnly but leaves the display cookies readable client-side", async () => {
		await registerUser("cookie-flags@example.com", "hunter22");

		const req = httpMocks.createRequest({
			method: "POST",
			body: { email: "cookie-flags@example.com", password: "hunter22" },
		});
		const res = httpMocks.createResponse();

		await loginUser(req, res);

		const setCookieHeaders = res.getHeader("Set-Cookie");
		const tokenCookie = setCookieHeaders.find((c) => c.startsWith("token="));
		const emailCookie = setCookieHeaders.find((c) => c.startsWith("email="));
		expect(tokenCookie.toLowerCase()).toMatch(/httponly/);
		expect(emailCookie.toLowerCase()).not.toMatch(/httponly/);
	});

	it("rejects the wrong password", async () => {
		await registerUser("d@example.com", "correctpassword");

		const req = httpMocks.createRequest({
			method: "POST",
			body: { email: "d@example.com", password: "wrongpassword" },
		});
		const res = httpMocks.createResponse();

		await loginUser(req, res);

		expect(res.statusCode).toBe(403);
	});

	it("rejects a login attempt for an email that was never registered", async () => {
		const req = httpMocks.createRequest({
			method: "POST",
			body: { email: "never-registered@example.com", password: "anything" },
		});
		const res = httpMocks.createResponse();

		await loginUser(req, res);

		expect(res.statusCode).toBe(403);
	});
});
