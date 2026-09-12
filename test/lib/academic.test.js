const { getClassStanding, getCurrentAcademicYear } = require("../../lib/academic");

describe("getCurrentAcademicYear", () => {
	it("stays in the same academic year for dates before August", () => {
		expect(getCurrentAcademicYear(new Date("2026-03-15T00:00:00Z"))).toBe(2026);
	});

	it("rolls into the next academic year starting in August", () => {
		expect(getCurrentAcademicYear(new Date("2026-08-15T00:00:00Z"))).toBe(2027);
	});
});

describe("getClassStanding", () => {
	const now = new Date("2026-09-01T00:00:00Z"); // academic year 2027

	it("returns null when no graduation year is set", () => {
		expect(getClassStanding(undefined, now)).toBeNull();
	});

	it("identifies a senior graduating this academic year", () => {
		expect(getClassStanding(2027, now)).toBe("senior");
	});

	it("identifies a junior graduating next year", () => {
		expect(getClassStanding(2028, now)).toBe("junior");
	});

	it("identifies a sophomore two years out", () => {
		expect(getClassStanding(2029, now)).toBe("sophomore");
	});

	it("identifies a freshman three years out", () => {
		expect(getClassStanding(2030, now)).toBe("freshman");
	});

	it("clamps anything further out to freshman rather than inventing a label", () => {
		expect(getClassStanding(2035, now)).toBe("freshman");
	});

	it("labels a past graduation year as alumni", () => {
		expect(getClassStanding(2020, now)).toBe("alumni");
	});
});
