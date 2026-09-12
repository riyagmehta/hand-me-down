import dbConnect from "../../../lib/dbConnect";
import requireAuth from "../../../lib/requireAuth";
import { purchaseBundle } from "../../../controllers/bundles/purchaseBundle";

export default async function handler(req, res) {
	const { method } = req;
	await dbConnect();

	switch (method) {
		case "POST":
			return requireAuth(purchaseBundle)(req, res);
			break;
	}
}
