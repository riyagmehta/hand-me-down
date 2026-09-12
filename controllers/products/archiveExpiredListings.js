const {
	UNAUTHENTICATED_ERROR,
	UNAUTHENTICATED_ERROR_CODE,
	INTERNAL_SERVER_ERROR,
	INTERNAL_SERVER_ERROR_CODE,
} = require("../../constants/constants");
const { logger } = require("../../debugger/logger");
const productModel = require("../../models/product.model");

// Called by a daily Vercel Cron trigger, not a logged-in user -- authorized
// by a shared secret instead of requireAuth. Browsing already filters on
// status:"active" independently of this job, so a missed or delayed run
// just means up to ~24h of staleness, not broken browsing.
const archiveExpiredListings = async (req, res) => {
	const expected = `Bearer ${process.env.CRON_SECRET}`;
	if (!process.env.CRON_SECRET || req.headers.authorization !== expected) {
		return res.status(UNAUTHENTICATED_ERROR_CODE).json({
			success: false,
			msg: UNAUTHENTICATED_ERROR,
		});
	}

	try {
		const result = await productModel.updateMany(
			{ status: "active", listingExpiresAt: { $lte: new Date() } },
			{ status: "archived" }
		);

		return res.json({ success: true, data: { archivedCount: result.modifiedCount } });
	} catch (err) {
		logger("error", __filename, "", err);
		return res
			.status(INTERNAL_SERVER_ERROR_CODE)
			.json({ success: false, msg: INTERNAL_SERVER_ERROR });
	}
};

module.exports = { archiveExpiredListings };
