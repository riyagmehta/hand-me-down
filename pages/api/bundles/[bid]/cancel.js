import dbConnect from "../../../../lib/dbConnect";
import requireAuth from "../../../../lib/requireAuth";
import { cancelBundle } from "../../../../controllers/bundles/cancelBundle";

export default async function handler(req, res) {
	const { method } = req;
	await dbConnect();

	switch (method) {
		case "PUT":
			return requireAuth(cancelBundle)(req, res);
			break;
	}
}
