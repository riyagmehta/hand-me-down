import dbConnect from "../../../lib/dbConnect";
import requireAuth from "../../../lib/requireAuth";
import { getRecommendedProducts } from "../../../controllers/products/getRecommendedProducts";

export default async function handler(req, res) {
	const { method } = req;
	await dbConnect();

	switch (method) {
		case "GET":
			return requireAuth(getRecommendedProducts)(req, res);
			break;
	}
}
