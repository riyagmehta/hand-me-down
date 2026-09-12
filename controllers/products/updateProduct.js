const {
	INTERNAL_SERVER_ERROR_CODE,
	INTERNAL_SERVER_ERROR,
	INVALID_REQUEST_DATA_CODE,
	INVALID_REQUEST_DATA,
} = require("../../constants/constants");
const { logger } = require("../../debugger/logger");
const productModel = require("../../models/product.model");
const mongoose = require("mongoose");
const { geocodeToGeoJSON } = require("../../lib/geocode");

const updateProduct = async (req, res) => {
	const { pid } = req.query;

	if (!mongoose.isValidObjectId(pid))
		return res.status(INVALID_REQUEST_DATA_CODE).json({
			success: false,
			msg: INVALID_REQUEST_DATA,
			action: "pid Validation",
		});

	const {
		name,
		price,
		counts,
		description,
		categories,
		condition,
		pickupAddress,
	} = req.body;

	try {
		const update = {
			name,
			price,
			counts,
			description,
			categories,
			condition,
			pickupAddress,
		};

		// Only re-geocode when the address actually changed. If the new
		// address fails to geocode, leave the previous location as-is rather
		// than clearing it -- a stale-but-plausible location beats none.
		if (pickupAddress) {
			const location = await geocodeToGeoJSON(pickupAddress);
			if (location) {
				update.location = location;
			}
		}

		const updatedProduct = await productModel.findOneAndUpdate(
			{ _id: pid, seller: req.user.uid },
			update,
			{ new: true, upsert: false }
		);

		if (!updatedProduct) {
			return res.status(INVALID_REQUEST_DATA_CODE).json({
				success: false,
				msg: INVALID_REQUEST_DATA,
				action: "Searching Product",
			});
		}

		return res.json({
			success: true,
			data: updatedProduct,
		});
	} catch (err) {
		logger("error", __filename, "", err);
		return res
			.status(INTERNAL_SERVER_ERROR_CODE)
			.json({ success: false, msg: INTERNAL_SERVER_ERROR });
	}
};

module.exports = { updateProduct };
