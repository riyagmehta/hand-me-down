import dbConnect from "../../../../lib/dbConnect";
import { getUserById } from "../../../../controllers/users/getUserById";
import { updateUser } from "../../../../controllers/users/updateUser";

export const config = {
	api: {
		bodyParser: false,
	},
};

export default async function handler(req, res) {
	const { method } = req;
	await dbConnect();

	switch (method) {
		case "GET":
			return getUserById(req, res);
			return;
			break;
		case "POST":
			break;
		case "PUT":
			return updateUser(req, res);
			break;
	}
}
