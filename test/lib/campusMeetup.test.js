const { suggestMeetupBuilding } = require("../../lib/campusMeetup");
const { CAMPUS_BUILDING_IDS } = require("../../constants/campusBuildings");

describe("suggestMeetupBuilding", () => {
	it("returns a real building from the fixed list, not a bare coordinate", () => {
		const [a, b] = CAMPUS_BUILDING_IDS;
		const result = suggestMeetupBuilding(a, b);

		expect(result).not.toBeNull();
		expect(CAMPUS_BUILDING_IDS).toContain(result.id);
	});

	it("suggests the same building itself when both parties are already there", () => {
		const [a] = CAMPUS_BUILDING_IDS;
		const result = suggestMeetupBuilding(a, a);

		expect(result.id).toBe(a);
	});

	it("returns null for an unknown building id", () => {
		expect(suggestMeetupBuilding("not-a-real-building", CAMPUS_BUILDING_IDS[0])).toBeNull();
	});
});
