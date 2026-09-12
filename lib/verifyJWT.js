import jwt from "jsonwebtoken";

const verifyJWT = (token) => {
	const JWT_SECRETS = process.env.JWT_SECRETS;

	if (!JWT_SECRETS) {
		throw new Error("Please define the JWT_SECRETS environment variable");
	}

	try {
		return jwt.verify(token, JWT_SECRETS);
	} catch (err) {
		return null;
	}
};

export default verifyJWT;
