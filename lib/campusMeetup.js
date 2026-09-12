const { greatCircleMidpoint, haversineDistanceKm } = require("./geo");
const { CAMPUS_BUILDINGS, getBuildingById } = require("../constants/campusBuildings");

// Computes the geometric midpoint between two campus buildings, then snaps
// it to the nearest *real* building in the fixed list -- "meet at the
// Student Union" is more useful than a bare coordinate that likely isn't
// an actual meetable place. Reuses the same great-circle math as the
// original address-based geospatial plan; only the coordinate source
// changed (a fixed, hardcoded list instead of live geocoding).
const suggestMeetupBuilding = (buildingIdA, buildingIdB) => {
	const a = getBuildingById(buildingIdA);
	const b = getBuildingById(buildingIdB);
	if (!a || !b) return null;

	const midpoint = greatCircleMidpoint({ lat: a.lat, lng: a.lng }, { lat: b.lat, lng: b.lng });

	let nearest = null;
	let nearestDistanceKm = Infinity;
	for (const building of CAMPUS_BUILDINGS) {
		const distanceKm = haversineDistanceKm(midpoint, {
			lat: building.lat,
			lng: building.lng,
		});
		if (distanceKm < nearestDistanceKm) {
			nearestDistanceKm = distanceKm;
			nearest = building;
		}
	}

	return nearest;
};

module.exports = { suggestMeetupBuilding };
