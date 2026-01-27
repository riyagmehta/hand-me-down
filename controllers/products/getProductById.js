const {
	INTERNAL_SERVER_ERROR_CODE,
	INTERNAL_SERVER_ERROR,
	INVALID_REQUEST_DATA_CODE,
	INVALID_REQUEST_DATA,
} = require("../../constants/constants");
const { logger } = require("../../debugger/logger");
const productModel = require("../../models/product.model");
const userModel = require("../../models/user.model");

const mongoose = require("mongoose");

const getProductById = async (req, res) => {
	const { pid } = req.query;

	if (!mongoose.isValidObjectId(pid))
		return res.status(INVALID_REQUEST_DATA_CODE).json({
			success: false,
			msg: INVALID_REQUEST_DATA,
			action: "pid Validation",
		});

	try {
		let foundProduct = await productModel.findOne({ _id: pid });

		if (!foundProduct) {
			return res.status(INVALID_REQUEST_DATA_CODE).json({
				success: false,
				msg: INVALID_REQUEST_DATA,
				action: "Searching Product",
			});
		}

		const seller = await userModel.findOne({ _id: foundProduct.seller });
		return res.json({
			success: true,
			data: { product: foundProduct, seller: seller },
		});
	} catch (err) {
		logger("error", __filename, "", err);
		return res
			.status(INTERNAL_SERVER_ERROR_CODE)
			.json({ success: false, msg: INTERNAL_SERVER_ERROR });
	}
};

module.exports = { getProductById };
