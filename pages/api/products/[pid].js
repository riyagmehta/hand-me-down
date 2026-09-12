import { getProductById } from "../../../controllers/products/getProductById";
import { updateProduct } from "../../../controllers/products/updateProduct";

import dbConnect from "../../../lib/dbConnect";
import requireAuth from "../../../lib/requireAuth";

export default async function handler(req, res) {
	const { method } = req;
	await dbConnect();

	switch (method) {
		case "GET":
			return getProductById(req, res);
			break;
		case "PUT":
			return requireAuth(updateProduct)(req, res);
			break;
	}
}
