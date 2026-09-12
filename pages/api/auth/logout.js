import { logoutUser } from "../../../controllers/auth/logoutUser";

export default async function handler(req, res) {
	const { method } = req;

	switch (method) {
		case "POST":
			return logoutUser(req, res);
			break;
	}
}
