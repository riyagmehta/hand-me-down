const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongod;

beforeAll(async () => {
	mongod = await MongoMemoryServer.create();
	process.env.MONGODB_URI = mongod.getUri();
	process.env.JWT_SECRETS = process.env.JWT_SECRETS || "test-jwt-secret";
});

afterEach(async () => {
	const collections = mongoose.connection.collections;
	for (const name in collections) {
		await collections[name].deleteMany({});
	}
});

afterAll(async () => {
	await mongoose.disconnect();
	if (mongod) await mongod.stop();
});
