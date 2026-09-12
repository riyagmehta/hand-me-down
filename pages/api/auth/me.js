import { getMe } from "../../../controllers/auth/getMe";
import requireAuth from "../../../lib/requireAuth";
import dbConnect from "../../../lib/dbConnect";

export default async function handler(req, res) {
	const { method } = req;
	await dbConnect();

	switch (method) {
		case "GET":
			return requireAuth(getMe)(req, res);
			break;
	}
}
