import { resendVerification } from "../../../controllers/auth/resendVerification";
import dbConnect from "../../../lib/dbConnect";

export default async function handler(req, res) {
	const { method } = req;
	await dbConnect();

	switch (method) {
		case "POST":
			return resendVerification(req, res);
			break;
	}
}
