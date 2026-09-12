const { scoreListing, rankListings } = require("../../lib/matching");

const now = new Date("2026-09-01T00:00:00Z"); // academic year 2027

describe("scoreListing", () => {
	it("scores a direct course match higher than a same-major-only match", () => {
		const viewer = { major: "Computer Science", courses: ["CS 301"] };
		const courseMatchListing = {
			createdAt: now,
			seller: { major: "Computer Science", graduationYear: 2030 },
			textbookDetails: { courseCode: "CS 301" },
		};
		const majorOnlyListing = {
			createdAt: now,
			seller: { major: "Computer Science", graduationYear: 2030 },
		};

		expect(scoreListing(courseMatchListing, viewer, now)).toBeGreaterThan(
			scoreListing(majorOnlyListing, viewer, now)
		);
	});

	it("boosts a graduating senior's listing over an otherwise identical junior's", () => {
		const viewer = { major: "Biology", courses: [] };
		const seniorListing = {
			createdAt: now,
			seller: { major: "Biology", graduationYear: 2027 },
		};
		const juniorListing = {
			createdAt: now,
			seller: { major: "Biology", graduationYear: 2029 },
		};

		expect(scoreListing(seniorListing, viewer, now)).toBeGreaterThan(
			scoreListing(juniorListing, viewer, now)
		);
	});

	it("still produces a sensible (non-zero, recency-based) score for a brand-new user with no tags", () => {
		const viewer = { major: undefined, courses: [] };
		const listing = {
			createdAt: now,
			seller: { major: "History", graduationYear: 2029 },
		};

		expect(scoreListing(listing, viewer, now)).toBeGreaterThan(0);
	});

	it("does not crash or match on a listing with no textbookDetails or seller major", () => {
		const viewer = { major: "Physics", courses: ["PHYS 210"] };
		const listing = { createdAt: now, seller: { graduationYear: 2028 } };

		expect(() => scoreListing(listing, viewer, now)).not.toThrow();
	});

	it("ranks more recent listings higher when all else is equal", () => {
		const viewer = { major: undefined, courses: [] };
		const recent = { createdAt: now, seller: {} };
		const old = {
			createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 60),
			seller: {},
		};

		expect(scoreListing(recent, viewer, now)).toBeGreaterThan(scoreListing(old, viewer, now));
	});
});

describe("rankListings", () => {
	it("sorts listings by score, highest first", () => {
		const viewer = { major: "Computer Science", courses: ["CS 301"] };
		const matching = {
			name: "matching",
			createdAt: now,
			seller: {},
			textbookDetails: { courseCode: "CS 301" },
		};
		const nonMatching = { name: "non-matching", createdAt: now, seller: {} };

		const ranked = rankListings([nonMatching, matching], viewer, now);

		expect(ranked[0].name).toBe("matching");
	});

	it("does not mutate the input array", () => {
		const viewer = { major: undefined, courses: [] };
		const listings = [
			{ name: "a", createdAt: now, seller: {} },
			{ name: "b", createdAt: now, seller: {} },
		];
		const original = [...listings];

		rankListings(listings, viewer, now);

		expect(listings).toEqual(original);
	});
});
