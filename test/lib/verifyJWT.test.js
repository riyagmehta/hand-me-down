const jwt = require("jsonwebtoken");

const REAL_SECRET = "test-jwt-secret";

describe("verifyJWT", () => {
	let verifyJWT;

	beforeEach(() => {
		process.env.JWT_SECRETS = REAL_SECRET;
		jest.resetModules();
		verifyJWT = require("../../lib/verifyJWT").default;
	});

	it("accepts a token signed with the real secret", () => {
		const token = jwt.sign({ uid: "abc123" }, REAL_SECRET);
		const decoded = verifyJWT(token);
		expect(decoded.uid).toBe("abc123");
	});

	it("rejects a token forged with a different secret", () => {
		const forgedToken = jwt.sign({ uid: "attacker-controlled-id" }, "wrong-secret");
		expect(verifyJWT(forgedToken)).toBeNull();
	});

	it("rejects a token that has expired", () => {
		const expiredToken = jwt.sign({ uid: "abc123" }, REAL_SECRET, {
			expiresIn: -10,
		});
		expect(verifyJWT(expiredToken)).toBeNull();
	});

	it("rejects garbage input instead of throwing", () => {
		expect(verifyJWT("not-a-real-jwt")).toBeNull();
	});
});
