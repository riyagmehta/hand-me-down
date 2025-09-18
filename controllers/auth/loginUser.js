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
import { setCookie, getCookies, getCookie } from "cookies-next";

const loginUser = async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(INVALID_REQUEST_DATA_CODE).json({
			success: false,
			msg: INVALID_REQUEST_DATA,
		});
	}

	try {
		const foundUser = await userModel.findOne({
			email: email,
			password: password,
		});

		if (!foundUser) {
			return res.status(INVALID_CREDENTIALS_ERROR_CODE).json({
				success: false,
				msg: INVALID_CREDENTIALS_ERROR,
				action: "Searching User",
			});
		}
		const JWT_SECRETS = process.env.JWT_SECRETS;

		const signedToken = jwt.sign({ uid: foundUser._id }, JWT_SECRETS);

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
