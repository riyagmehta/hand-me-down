import dbConnect from "../../../lib/dbConnect";
import { postUser } from "../../../controllers/users/postUser";
export default async function handler(req, res) {
	const { method } = req;
	await dbConnect();

	switch (method) {
		case "GET":
			return;
			break;
		case "POST":
			return postUser(req, res);
			break;
		case "PUT":
			break;
	}
}
