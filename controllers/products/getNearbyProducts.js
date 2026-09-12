const {
	INVALID_REQUEST_DATA,
	INVALID_REQUEST_DATA_CODE,
	INTERNAL_SERVER_ERROR,
	INTERNAL_SERVER_ERROR_CODE,
} = require("../../constants/constants");
const { logger } = require("../../debugger/logger");
const productModel = require("../../models/product.model");

const DEFAULT_RADIUS_KM = 10;
const MAX_RADIUS_KM = 100;

const getNearbyProducts = async (req, res) => {
	const { lat, lng, radiusKm } = req.query;

	const parsedLat = parseFloat(lat);
	const parsedLng = parseFloat(lng);
	const parsedRadiusKm = radiusKm !== undefined ? parseFloat(radiusKm) : DEFAULT_RADIUS_KM;

	if (
		Number.isNaN(parsedLat) ||
		Number.isNaN(parsedLng) ||
		parsedLat < -90 ||
		parsedLat > 90 ||
		parsedLng < -180 ||
		parsedLng > 180 ||
		Number.isNaN(parsedRadiusKm) ||
		parsedRadiusKm <= 0
	) {
		return res.status(INVALID_REQUEST_DATA_CODE).json({
			success: false,
			msg: INVALID_REQUEST_DATA,
		});
	}

	const radiusMeters = Math.min(parsedRadiusKm, MAX_RADIUS_KM) * 1000;

	try {
		// $nearSphere requires the 2dsphere index and returns results sorted
		// nearest-first; products with no location simply never match it.
		const products = await productModel.find({
			location: {
				$nearSphere: {
					$geometry: { type: "Point", coordinates: [parsedLng, parsedLat] },
					$maxDistance: radiusMeters,
				},
			},
		});

		return res.json({ success: true, data: products });
	} catch (err) {
		logger("error", __filename, "", err);
		return res
			.status(INTERNAL_SERVER_ERROR_CODE)
			.json({ success: false, msg: INTERNAL_SERVER_ERROR });
	}
};

module.exports = { getNearbyProducts };
