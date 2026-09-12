const {
	INVALID_REQUEST_DATA,
	INVALID_REQUEST_DATA_CODE,
	INTERNAL_SERVER_ERROR,
	INTERNAL_SERVER_ERROR_CODE,
} = require("../../constants/constants");
const { logger } = require("../../debugger/logger");
const productModel = require("../../models/product.model");
const { CAMPUS_BUILDING_IDS } = require("../../constants/campusBuildings");

// "Near my dorm" is an exact match on a fixed, known set of buildings, not
// a distance calculation over arbitrary coordinates -- simpler and, for a
// campus this size, exactly as useful.
const getProductsByBuilding = async (req, res) => {
	const { buildingId } = req.query;

	if (!buildingId || !CAMPUS_BUILDING_IDS.includes(buildingId)) {
		return res.status(INVALID_REQUEST_DATA_CODE).json({
			success: false,
			msg: INVALID_REQUEST_DATA,
		});
	}

	try {
		const products = await productModel.find({
			pickupBuildingId: buildingId,
			status: "active",
		});

		return res.json({ success: true, data: products });
	} catch (err) {
		logger("error", __filename, "", err);
		return res
			.status(INTERNAL_SERVER_ERROR_CODE)
			.json({ success: false, msg: INTERNAL_SERVER_ERROR });
	}
};

module.exports = { getProductsByBuilding };
