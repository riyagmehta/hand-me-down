import dbConnect from "../../../../../lib/dbConnect";
import requireAuth from "../../../../../lib/requireAuth";
import { removeFromWishList } from "../../../../../controllers/users/wishlist/removeFromWishlist";

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
			return requireAuth(removeFromWishList)(req, res);
			break;
	}
}
