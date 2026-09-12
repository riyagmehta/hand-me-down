import { verifyEmail } from "../../../controllers/auth/verifyEmail";
import dbConnect from "../../../lib/dbConnect";

export default async function handler(req, res) {
	const { method } = req;
	await dbConnect();

	switch (method) {
		case "POST":
			return verifyEmail(req, res);
			break;
	}
}
