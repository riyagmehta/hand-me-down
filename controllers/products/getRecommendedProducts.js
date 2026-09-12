const {
	INTERNAL_SERVER_ERROR,
	INTERNAL_SERVER_ERROR_CODE,
} = require("../../constants/constants");
const { logger } = require("../../debugger/logger");
const userModel = require("../../models/user.model");
const productModel = require("../../models/product.model");
const { rankListings } = require("../../lib/matching");

const RECOMMENDATION_LIMIT = 20;
// A bounded candidate set keeps in-application scoring cheap -- fine at
// this app's realistic scale (a single campus' worth of active listings),
// where nothing close to needing a precomputed/offline recommendation
// pipeline.
const CANDIDATE_LIMIT = 200;

const getRecommendedProducts = async (req, res) => {
	try {
		const viewer = await userModel.findOne({ _id: req.user.uid });

		const candidates = await productModel
			.find({ status: "active", seller: { $ne: req.user.uid }, bundledIn: null })
			.sort({ createdAt: -1 })
			.limit(CANDIDATE_LIMIT)
			.populate("seller");

		const ranked = rankListings(candidates, {
			major: viewer?.major,
			courses: viewer?.courses || [],
		});

		return res.json({ success: true, data: ranked.slice(0, RECOMMENDATION_LIMIT) });
	} catch (err) {
		logger("error", __filename, "", err);
		return res
			.status(INTERNAL_SERVER_ERROR_CODE)
			.json({ success: false, msg: INTERNAL_SERVER_ERROR });
	}
};

module.exports = { getRecommendedProducts };
