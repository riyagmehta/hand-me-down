import { loginUser } from "../../../controllers/auth/loginUser";
import dbConnect from "../../../lib/dbConnect";

export default async function handler(req, res) {
	const { method } = req;
	await dbConnect();

	switch (method) {
		case "GET":
			return;
			break;
		case "POST":
			return loginUser(req, res);
			break;
		case "PUT":
			break;
	}
}
