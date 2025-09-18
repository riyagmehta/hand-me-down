const {
	INTERNAL_SERVER_ERROR_CODE,
	INTERNAL_SERVER_ERROR,
} = require("../../constants/constants");
const { logger } = require("../../debugger/logger");
const productModel = require("../../models/product.model");
import formidable from "formidable";
import { uploadFileToCDN } from "../../lib/cloudinary";

const formidableConfig = {
	keepExtensions: true,
	// maxFileSize: 10_000_000,
	// maxFieldsSize: 10_000_000,
	// maxFields: 2,
	allowEmptyFiles: false,
	multiples: true,
	uploadDir: __dirname,
};

const postProduct = async (req, res) => {
	const form = formidable(formidableConfig);
	try {
		form.parse(req, async (err, fields, files) => {
			if (err) {
				return res
					.status(INTERNAL_SERVER_ERROR_CODE)
					.json({ success: false, msg: INTERNAL_SERVER_ERROR });
			}

			let { product } = fields;
			let { productImages } = files;
			let productImagesURLs = [];

			if (Array.isArray(productImages)) {
				productImagesURLs = await Promise.all(
					productImages.map((file) => {
						return uploadFileToCDN(file.filepath);
					})
				);
			} else if (productImages) {
				productImagesURLs.push(await uploadFileToCDN(productImages.filepath));
			}

			const productJSON = JSON.parse(product);

			const newProduct = productModel({
				...productJSON,
				productImages: productImagesURLs,
			});

			newProduct
				.save()
				.then((savedProduct) => {
					return res.json({ success: true, data: savedProduct });
				})
				.catch((err) => {
					logger("error", __filename, "while saving", err);
					return res
						.status(INTERNAL_SERVER_ERROR_CODE)
						.json({ success: false, msg: INTERNAL_SERVER_ERROR });
				});
		});
	} catch (err) {
		logger("error", __filename, "", err);

		return res
			.status(INTERNAL_SERVER_ERROR_CODE)
			.json({ success: false, msg: INTERNAL_SERVER_ERROR });
	}
};

module.exports = { postProduct };
