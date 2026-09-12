const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees) => (degrees * Math.PI) / 180;
const toDegrees = (radians) => (radians * 180) / Math.PI;

/**
 * Great-circle distance between two {lat, lng} points, in kilometers.
 */
const haversineDistanceKm = (a, b) => {
	const phi1 = toRadians(a.lat);
	const phi2 = toRadians(b.lat);
	const deltaPhi = toRadians(b.lat - a.lat);
	const deltaLambda = toRadians(b.lng - a.lng);

	const sinHalfPhi = Math.sin(deltaPhi / 2);
	const sinHalfLambda = Math.sin(deltaLambda / 2);

	const h =
		sinHalfPhi * sinHalfPhi +
		Math.cos(phi1) * Math.cos(phi2) * sinHalfLambda * sinHalfLambda;

	return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

/**
 * The great-circle midpoint between two {lat, lng} points -- the point on
 * the geodesic connecting them that is equidistant from both (minimizes the
 * *maximum* of the two travel distances, not the sum -- every point on the
 * geodesic ties for that). Plain averaging of lat/lng is only a good
 * approximation for points close together; this is the correct spherical
 * formula regardless of distance.
 */
const greatCircleMidpoint = (a, b) => {
	const phi1 = toRadians(a.lat);
	const phi2 = toRadians(b.lat);
	const lambda1 = toRadians(a.lng);
	const deltaLambda = toRadians(b.lng - a.lng);

	const bx = Math.cos(phi2) * Math.cos(deltaLambda);
	const by = Math.cos(phi2) * Math.sin(deltaLambda);

	const phiM = Math.atan2(
		Math.sin(phi1) + Math.sin(phi2),
		Math.sqrt((Math.cos(phi1) + bx) ** 2 + by ** 2)
	);
	const lambdaM = lambda1 + Math.atan2(by, Math.cos(phi1) + bx);

	return { lat: toDegrees(phiM), lng: toDegrees(lambdaM) };
};

module.exports = { haversineDistanceKm, greatCircleMidpoint };
