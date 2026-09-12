const mongoose = require("mongoose");
const dbConnect = require("../../lib/dbConnect").default;

describe("dbConnect", () => {
	it("connects to the in-memory database", async () => {
		await dbConnect();
		expect(mongoose.connection.readyState).toBe(1);
	});
});
