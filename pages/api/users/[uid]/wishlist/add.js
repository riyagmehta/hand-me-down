import dbConnect from "../../../../../lib/dbConnect";
import requireAuth from "../../../../../lib/requireAuth";
import { addToWishList } from "../../../../../controllers/users/wishlist/addToWishList";

export default async function handler(req, res) {
	const { method } = req;
	await dbConnect();

	switch (method) {
		case "GET":
			return;
			break;
		case "POST":
			break;
		case "PUT":
			return requireAuth(addToWishList)(req, res);
			break;
	}
}
