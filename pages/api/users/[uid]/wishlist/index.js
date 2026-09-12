import dbConnect from "../../../../../lib/dbConnect";
import requireAuth from "../../../../../lib/requireAuth";
import { getWishList } from "../../../../../controllers/users/wishlist/getWishlist";

export default async function handler(req, res) {
	const { method } = req;
	await dbConnect();

	switch (method) {
		case "GET":
			return requireAuth(getWishList)(req, res);
			break;
		case "POST":
			break;
		case "PUT":
			break;
	}
}
