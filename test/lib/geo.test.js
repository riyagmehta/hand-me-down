const { haversineDistanceKm, greatCircleMidpoint } = require("../../lib/geo");

describe("haversineDistanceKm", () => {
	it("returns 0 for the same point", () => {
		expect(haversineDistanceKm({ lat: 12.9, lng: 77.6 }, { lat: 12.9, lng: 77.6 })).toBe(0);
	});

	it("matches the commonly-cited NYC-London distance within a small tolerance", () => {
		const nyc = { lat: 40.7128, lng: -74.006 };
		const london = { lat: 51.5074, lng: -0.1278 };
		const distance = haversineDistanceKm(nyc, london);
		expect(distance).toBeGreaterThan(5500);
		expect(distance).toBeLessThan(5600);
	});
});

describe("greatCircleMidpoint", () => {
	it("returns the point itself when both inputs are the same", () => {
		const point = { lat: 40.7128, lng: -74.006 };
		const midpoint = greatCircleMidpoint(point, point);
		expect(midpoint.lat).toBeCloseTo(point.lat, 6);
		expect(midpoint.lng).toBeCloseTo(point.lng, 6);
	});

	it("lands exactly at the equator/prime-meridian-relative center for a symmetric pair", () => {
		const midpoint = greatCircleMidpoint({ lat: 0, lng: -10 }, { lat: 0, lng: 10 });
		expect(midpoint.lat).toBeCloseTo(0, 6);
		expect(midpoint.lng).toBeCloseTo(0, 6);
	});

	it("is equidistant from both endpoints (minimizes the max, not just any point)", () => {
		const seller = { lat: 12.9716, lng: 77.5946 }; // Bangalore
		const buyer = { lat: 13.0827, lng: 80.2707 }; // Chennai
		const midpoint = greatCircleMidpoint(seller, buyer);

		const distToSeller = haversineDistanceKm(midpoint, seller);
		const distToBuyer = haversineDistanceKm(midpoint, buyer);

		expect(distToSeller).toBeCloseTo(distToBuyer, 2);
	});

	it("lies on the geodesic between the two points (distances sum to the total)", () => {
		const seller = { lat: 12.9716, lng: 77.5946 };
		const buyer = { lat: 13.0827, lng: 80.2707 };
		const midpoint = greatCircleMidpoint(seller, buyer);

		const total = haversineDistanceKm(seller, buyer);
		const viaMidpoint =
			haversineDistanceKm(seller, midpoint) + haversineDistanceKm(midpoint, buyer);

		expect(viaMidpoint).toBeCloseTo(total, 2);
	});
});
