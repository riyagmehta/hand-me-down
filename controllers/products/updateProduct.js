const {
	INTERNAL_SERVER_ERROR_CODE,
	INTERNAL_SERVER_ERROR,
	INVALID_REQUEST_DATA_CODE,
	INVALID_REQUEST_DATA,
} = require("../../constants/constants");
const { logger } = require("../../debugger/logger");
const productModel = require("../../models/product.model");
const mongoose = require("mongoose");

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
		const updatedProduct = await productModel.findOneAndUpdate(
			{ _id: pid },
			{
				name,
				price,
				counts,
				description,
				categories,
				condition,
				pickupAddress,
			},
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
