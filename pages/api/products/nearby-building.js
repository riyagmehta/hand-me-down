import dbConnect from "../../../lib/dbConnect";
import { getProductsByBuilding } from "../../../controllers/products/getProductsByBuilding";

export default async function handler(req, res) {
	const { method } = req;
	await dbConnect();

	switch (method) {
		case "GET":
			return getProductsByBuilding(req, res);
			break;
	}
}
