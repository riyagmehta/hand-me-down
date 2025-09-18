import dbConnect from "../../../../../lib/dbConnect";
import { getWishList } from "../../../../../controllers/users/wishlist/getWishlist";

export default async function handler(req, res) {
	const { method } = req;
	await dbConnect();

	switch (method) {
		case "GET":
			return getWishList(req, res);
			break;
		case "POST":
			break;
		case "PUT":
			break;
	}
}
