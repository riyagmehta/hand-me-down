const {
	INTERNAL_SERVER_ERROR_CODE,
	INTERNAL_SERVER_ERROR,
	INVALID_REQUEST_DATA_CODE,
	INVALID_REQUEST_DATA,
} = require("../../constants/constants");
const { logger } = require("../../debugger/logger");
const productModel = require("../../models/product.model");
const mongoose = require("mongoose");

const getProductsWithFilter = async (req, res) => {
	let { keyword, minPrice, maxPrice, seller } = req.query;
	if (seller) {
		if (!mongoose.isValidObjectId(seller))
			return res.status(INVALID_REQUEST_DATA_CODE).json({
				success: false,
				msg: INVALID_REQUEST_DATA,
				action: "pid Validation",
			});
		try {
			const foundProducts = await productModel.find({ seller });

			return res.json({
				success: true,
				data: foundProducts,
			});
		} catch (err) {
			logger("error", __filename, "", err);
			return res
				.status(INTERNAL_SERVER_ERROR_CODE)
				.json({ success: false, msg: INTERNAL_SERVER_ERROR });
		}
	}
	if (!keyword) keyword = ".*.";
	if (!minPrice) minPrice = 0;
	if (!maxPrice) maxPrice = 1e9;

	try {
		const foundProducts = await productModel.find({
			$or: [
				{
					name: {
						$regex: keyword,
						$options: "i",
					},
				},
				{
					description: {
						$regex: keyword,
						$options: "i",
					},
				},
			],
			$and: [
				{
					price: { $gte: minPrice },
				},
				{
					price: { $lte: maxPrice },
				},
			],
		});

		return res.json({
			success: true,
			data: foundProducts,
		});
	} catch (err) {
		logger("error", __filename, "", err);
		return res
			.status(INTERNAL_SERVER_ERROR_CODE)
			.json({ success: false, msg: INTERNAL_SERVER_ERROR });
	}
};

module.exports = { getProductsWithFilter };
