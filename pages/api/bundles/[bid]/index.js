import dbConnect from "../../../../lib/dbConnect";
import { getBundleById } from "../../../../controllers/bundles/getBundleById";

export default async function handler(req, res) {
	const { method } = req;
	await dbConnect();

	switch (method) {
		case "GET":
			return getBundleById(req, res);
			break;
	}
}
