const { geocodeAddress, geocodeToGeoJSON } = require("../../lib/geocode");

describe("geocodeAddress", () => {
	const realFetch = global.fetch;

	afterEach(() => {
		global.fetch = realFetch;
	});

	it("returns coordinates for a successful lookup", async () => {
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: async () => [{ lat: "12.9716", lon: "77.5946" }],
		});

		const result = await geocodeAddress("Bangalore, India");

		expect(result).toEqual({ lat: 12.9716, lng: 77.5946 });
		expect(global.fetch).toHaveBeenCalledTimes(1);
		const [url, options] = global.fetch.mock.calls[0];
		expect(url).toContain("nominatim.openstreetmap.org");
		expect(options.headers["User-Agent"]).toBeTruthy();
	});

	it("returns null when Nominatim finds no match", async () => {
		global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [] });

		const result = await geocodeAddress("asdkjfhaskjdfh nonsense address");

		expect(result).toBeNull();
	});

	it("returns null on a non-ok HTTP response instead of throwing", async () => {
		global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 });

		const result = await geocodeAddress("123 Main St");

		expect(result).toBeNull();
	});

	it("returns null on a network error instead of throwing", async () => {
		global.fetch = jest.fn().mockRejectedValue(new Error("network down"));

		const result = await geocodeAddress("123 Main St");

		expect(result).toBeNull();
	});

	it("returns null for an empty address without calling fetch", async () => {
		global.fetch = jest.fn();

		const result = await geocodeAddress("");

		expect(result).toBeNull();
		expect(global.fetch).not.toHaveBeenCalled();
	});

	it("throttles consecutive requests to roughly 1/second", async () => {
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: async () => [{ lat: "1", lon: "1" }],
		});

		const start = Date.now();
		await geocodeAddress("first address");
		await geocodeAddress("second address");
		const elapsed = Date.now() - start;

		expect(elapsed).toBeGreaterThanOrEqual(1000);
	}, 10000);
});

describe("geocodeToGeoJSON", () => {
	const realFetch = global.fetch;

	afterEach(() => {
		global.fetch = realFetch;
	});

	it("returns a GeoJSON Point with [lng, lat] coordinate order", async () => {
		global.fetch = jest.fn().mockResolvedValue({
			ok: true,
			json: async () => [{ lat: "12.9716", lon: "77.5946" }],
		});

		const result = await geocodeToGeoJSON("Bangalore, India");

		expect(result).toEqual({ type: "Point", coordinates: [77.5946, 12.9716] });
	});

	it("returns undefined when geocoding fails", async () => {
		global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [] });

		const result = await geocodeToGeoJSON("nonsense address");

		expect(result).toBeUndefined();
	});
});
