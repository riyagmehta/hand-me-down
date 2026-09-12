import dbConnect from "../../../lib/dbConnect";
import requireAuth from "../../../lib/requireAuth";
import { placeOrder } from "../../../controllers/orders/placeOrder";
import { getMyOrders } from "../../../controllers/orders/getMyOrders";

export default async function handler(req, res) {
	const { method } = req;
	await dbConnect();

	switch (method) {
		case "GET":
			return requireAuth(getMyOrders)(req, res);
			break;
		case "POST":
			return requireAuth(placeOrder)(req, res);
			break;
	}
}
