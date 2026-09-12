import dbConnect from "../../../lib/dbConnect";
import { getNearbyProducts } from "../../../controllers/products/getNearbyProducts";

export default async function handler(req, res) {
	const { method } = req;
	await dbConnect();

	switch (method) {
		case "GET":
			return getNearbyProducts(req, res);
			break;
	}
}
