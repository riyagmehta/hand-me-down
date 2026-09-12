import dbConnect from "../../../lib/dbConnect";
import requireAuth from "../../../lib/requireAuth";
import { createBundle } from "../../../controllers/bundles/createBundle";

export default async function handler(req, res) {
	const { method } = req;
	await dbConnect();

	switch (method) {
		case "POST":
			return requireAuth(createBundle)(req, res);
			break;
	}
}
