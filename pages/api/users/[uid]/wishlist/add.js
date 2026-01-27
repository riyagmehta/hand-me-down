import dbConnect from "../../../../../lib/dbConnect";
import { addToWishList } from "../../../../../controllers/users/wishlist/addToWishList";
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
			return addToWishList(req, res);
			break;
	}
}
