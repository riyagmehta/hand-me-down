// Wraps OpenStreetMap's Nominatim (free, no API key). Its usage policy caps
// requests at ~1/second and requires a real User-Agent -- both handled here
// so callers don't have to think about it. Geocoding is meant to happen only
// when an address is created/changed, never on every read.
const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";
const USER_AGENT = "HandMeDown/1.0 (https://github.com/riyagmehta/hand-me-down)";
const MIN_REQUEST_INTERVAL_MS = 1100;
const REQUEST_TIMEOUT_MS = 5000;

let lastRequestAt = 0;
let throttleQueue = Promise.resolve();

// Only guarantees spacing between calls within a single warm process --
// serverless platforms can run multiple isolates concurrently, and this
// doesn't coordinate across them. A real distributed rate limiter would
// need shared infra (e.g. Redis), which is off the table on a free tier;
// this is the honest, no-paid-infra version, not a strict global guarantee.
const throttle = () => {
	const run = throttleQueue.then(async () => {
		const wait = Math.max(0, lastRequestAt + MIN_REQUEST_INTERVAL_MS - Date.now());
		if (wait > 0) {
			await new Promise((resolve) => setTimeout(resolve, wait));
		}
		lastRequestAt = Date.now();
	});
	throttleQueue = run.catch(() => {});
	return run;
};

// Best-effort: returns null on any failure (not found, network error,
// timeout) rather than throwing, so a geocoding hiccup never blocks saving
// a listing.
const geocodeAddress = async (address) => {
	if (!address) return null;

	await throttle();

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

	try {
		const url = `${NOMINATIM_BASE_URL}/search?format=jsonv2&limit=1&q=${encodeURIComponent(
			address
		)}`;
		const response = await fetch(url, {
			headers: { "User-Agent": USER_AGENT },
			signal: controller.signal,
		});

		if (!response.ok) return null;

		const results = await response.json();
		if (!Array.isArray(results) || results.length === 0) return null;

		const { lat, lon } = results[0];
		const parsedLat = parseFloat(lat);
		const parsedLng = parseFloat(lon);
		if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) return null;

		return { lat: parsedLat, lng: parsedLng };
	} catch (err) {
		return null;
	} finally {
		clearTimeout(timeoutId);
	}
};

// Convenience wrapper returning the shape Mongoose's GeoJSON Point schema
// expects, or undefined if geocoding didn't resolve.
const geocodeToGeoJSON = async (address) => {
	const coords = await geocodeAddress(address);
	if (!coords) return undefined;
	return { type: "Point", coordinates: [coords.lng, coords.lat] };
};

module.exports = { geocodeAddress, geocodeToGeoJSON };
