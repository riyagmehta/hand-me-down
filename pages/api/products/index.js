import dbConnect from "../../../lib/dbConnect";
import { getProductsWithFilter } from "../../../controllers/products/getProductsWithFilter";
import { postProduct } from "../../../controllers/products/postProduct";

export const config = {
	api: {
		bodyParser: false,
	},
};

export default async function handler(req, res) {
	const { method } = req;
	await dbConnect();

	switch (method) {
		case "GET":
			return getProductsWithFilter(req, res);
			break;
		case "POST":
			return postProduct(req, res);
			break;
	}
}
