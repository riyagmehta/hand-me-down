import dbConnect from "../../../lib/dbConnect";
import requireAuth from "../../../lib/requireAuth";
import { placeOrder } from "../../../controllers/orders/placeOrder";

export default async function handler(req, res) {
	const { method } = req;
	await dbConnect();

	switch (method) {
		case "POST":
			return requireAuth(placeOrder)(req, res);
			break;
	}
}
