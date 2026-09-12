import dbConnect from "../../../../lib/dbConnect";
import requireAuth from "../../../../lib/requireAuth";
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
			return requireAuth(getUserById)(req, res);
			break;
		case "POST":
			break;
		case "PUT":
			return requireAuth(updateUser)(req, res);
			break;
	}
}
