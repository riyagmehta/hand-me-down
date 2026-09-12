import dbConnect from "../../../lib/dbConnect";
import { archiveExpiredListings } from "../../../controllers/products/archiveExpiredListings";

export default async function handler(req, res) {
	const { method } = req;
	await dbConnect();

	switch (method) {
		case "GET":
			return archiveExpiredListings(req, res);
			break;
	}
}
