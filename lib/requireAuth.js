import { getCookie } from "cookies-next";
import verifyJWT from "./verifyJWT";
import {
	UNAUTHENTICATED_ERROR,
	UNAUTHENTICATED_ERROR_CODE,
} from "../constants/constants";

const requireAuth = (handler) => async (req, res) => {
	const token = getCookie("token", { req, res });

	const decoded = token ? verifyJWT(token) : null;

	if (!decoded || !decoded.uid) {
		return res.status(UNAUTHENTICATED_ERROR_CODE).json({
			success: false,
			msg: UNAUTHENTICATED_ERROR,
		});
	}

	req.user = { uid: decoded.uid };
	return handler(req, res);
};

export default requireAuth;
