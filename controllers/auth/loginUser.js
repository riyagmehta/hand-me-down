const {
	INVALID_CREDENTIALS_ERROR,
	INVALID_CREDENTIALS_ERROR_CODE,
	INTERNAL_SERVER_ERROR,
	INTERNAL_SERVER_ERROR_CODE,
	INVALID_REQUEST_DATA,
	INVALID_REQUEST_DATA_CODE,
} = require("../../constants/constants");
const { logger } = require("../../debugger/logger");
const userModel = require("../../models/user.model");

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { setCookie, getCookies, getCookie } from "cookies-next";

// A precomputed bcrypt hash with no matching plaintext, compared against
// when no user is found so lookup and mismatch take the same time and
// the response can't be used to enumerate registered emails.
const DUMMY_HASH =
	"$2a$12$CwTycUXWue0Thq9StjUM0uJ8Q5NRRoc2fnpwvuk1J8xUMBrKAI9se";

const loginUser = async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(INVALID_REQUEST_DATA_CODE).json({
			success: false,
			msg: INVALID_REQUEST_DATA,
		});
	}

	try {
		const foundUser = await userModel.findOne({ email: email });

		const passwordMatches = await bcrypt.compare(
			password,
			foundUser ? foundUser.password : DUMMY_HASH
		);

		if (!foundUser || !passwordMatches) {
			return res.status(INVALID_CREDENTIALS_ERROR_CODE).json({
				success: false,
				msg: INVALID_CREDENTIALS_ERROR,
			});
		}
		const JWT_SECRETS = process.env.JWT_SECRETS;

		if (!JWT_SECRETS) {
			throw new Error("Please define the JWT_SECRETS environment variable");
		}

		const signedToken = jwt.sign({ uid: foundUser._id }, JWT_SECRETS, {
			expiresIn: "7d",
		});

		setCookie("token", signedToken, {
			req,
			res,
			secure: false,
			httpOnly: false,
		});

		setCookie("email", foundUser.email, {
			req,
			res,
			secure: false,
			httpOnly: false,
		});

		setCookie("name", foundUser.firstName, {
			req,
			res,
			secure: false,
			httpOnly: false,
		});

		return res.json({
			success: true,
			data: foundUser._id,
		});
	} catch (err) {
		logger("error", __filename, "", err);
		return res
			.status(INTERNAL_SERVER_ERROR_CODE)
			.json({ success: false, msg: INTERNAL_SERVER_ERROR });
	}
};

module.exports = { loginUser };
