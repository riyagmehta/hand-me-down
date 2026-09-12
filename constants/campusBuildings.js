// Placeholder fixture for a fictional "Example University" campus.
// Coordinates are illustrative, not real -- swap this list for your actual
// school's buildings/dorms before deploying. This is deliberately a plain
// hardcoded list rather than any geocoding API call: zero external
// requests, zero billing surface, looked up once and never again.
const CAMPUS_BUILDINGS = [
	{ id: "north-hall", name: "North Hall", type: "dorm", lat: 40.003, lng: -75.0 },
	{ id: "south-hall", name: "South Hall", type: "dorm", lat: 39.9975, lng: -75.001 },
	{ id: "east-commons", name: "East Commons", type: "dorm", lat: 40.0005, lng: -74.995 },
	{ id: "west-quad", name: "West Quad", type: "dorm", lat: 40.001, lng: -75.006 },
	{ id: "science-hall", name: "Science Hall", type: "academic", lat: 40.0, lng: -75.0 },
	{ id: "library", name: "Main Library", type: "academic", lat: 39.999, lng: -74.999 },
	{
		id: "student-union",
		name: "Student Union",
		type: "campus-center",
		lat: 40.0,
		lng: -75.001,
	},
	{
		id: "athletics-center",
		name: "Athletics Center",
		type: "campus-center",
		lat: 40.005,
		lng: -75.003,
	},
];

const CAMPUS_BUILDING_IDS = CAMPUS_BUILDINGS.map((building) => building.id);

const getBuildingById = (id) => CAMPUS_BUILDINGS.find((building) => building.id === id) || null;

module.exports = { CAMPUS_BUILDINGS, CAMPUS_BUILDING_IDS, getBuildingById };
