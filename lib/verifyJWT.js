import jwt from "jsonwebtoken";

const verifyJWT = (token) => {
	try {
		const decoded = jwt.decode(token, process.env.JWT_SECRETS);
		return decoded;
	} catch (err) {
		console.log("JWT err >> ", err);
		return {};
	}
};

export default verifyJWT;
