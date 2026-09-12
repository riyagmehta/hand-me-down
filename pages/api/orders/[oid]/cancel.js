import dbConnect from "../../../../lib/dbConnect";
import requireAuth from "../../../../lib/requireAuth";
import { cancelOrder } from "../../../../controllers/orders/cancelOrder";

export default async function handler(req, res) {
	const { method } = req;
	await dbConnect();

	switch (method) {
		case "PUT":
			return requireAuth(cancelOrder)(req, res);
			break;
	}
}
