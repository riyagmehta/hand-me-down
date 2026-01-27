import { getProductById } from "../../../controllers/products/getProductById";
import { updateProduct } from "../../../controllers/products/updateProduct";

import dbConnect from "../../../lib/dbConnect";

export default async function handler(req, res) {
	const { method } = req;
	await dbConnect();

	switch (method) {
		case "GET":
			return getProductById(req, res);
			break;
		case "PUT":
			return updateProduct(req, res);
			break;
	}
}
