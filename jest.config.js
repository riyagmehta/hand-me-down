const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const customJestConfig = {
	testEnvironment: "node",
	setupFilesAfterEnv: ["<rootDir>/test/setup.js"],
	testPathIgnorePatterns: ["/node_modules/", "/.next/"],
	testTimeout: 20000,
};

module.exports = createJestConfig(customJestConfig);
