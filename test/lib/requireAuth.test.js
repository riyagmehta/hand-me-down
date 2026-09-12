const httpMocks = require("node-mocks-http");
const jwt = require("jsonwebtoken");
const requireAuth = require("../../lib/requireAuth").default;

const SECRET = "test-jwt-secret";

beforeEach(() => {
	process.env.JWT_SECRETS = SECRET;
});

function requestWithToken(token) {
	return httpMocks.createRequest({
		method: "GET",
		cookies: token ? { token } : {},
	});
}

describe("requireAuth", () => {
	it("rejects a request with no token", async () => {
		const handler = jest.fn();
		const req = requestWithToken(undefined);
		const res = httpMocks.createResponse();

		await requireAuth(handler)(req, res);

		expect(res.statusCode).toBe(401);
		expect(handler).not.toHaveBeenCalled();
	});

	it("rejects a forged token signed with the wrong secret", async () => {
		const handler = jest.fn();
		const forged = jwt.sign({ uid: "attacker" }, "wrong-secret");
		const req = requestWithToken(forged);
		const res = httpMocks.createResponse();

		await requireAuth(handler)(req, res);

		expect(res.statusCode).toBe(401);
		expect(handler).not.toHaveBeenCalled();
	});

	it("calls through with req.user set for a valid token", async () => {
		const handler = jest.fn((req, res) => res.json({ uid: req.user.uid }));
		const token = jwt.sign({ uid: "real-user-id" }, SECRET);
		const req = requestWithToken(token);
		const res = httpMocks.createResponse();

		await requireAuth(handler)(req, res);

		expect(handler).toHaveBeenCalledTimes(1);
		expect(res._getJSONData()).toEqual({ uid: "real-user-id" });
	});
});
