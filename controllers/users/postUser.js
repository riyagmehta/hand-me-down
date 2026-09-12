const {
	INTERNAL_SERVER_ERROR_CODE,
	INTERNAL_SERVER_ERROR,
	INVALID_REQUEST_DATA_CODE,
	INVALID_REQUEST_DATA,
} = require("../../constants/constants");
const { logger } = require("../../debugger/logger");
const userModel = require("../../models/user.model");
const bcrypt = require("bcryptjs");

const postUser = async (req, res) => {
	if (!req.body.password) {
		return res.status(INVALID_REQUEST_DATA_CODE).json({
			success: false,
			msg: INVALID_REQUEST_DATA,
		});
	}

	try {
		const hashedPassword = await bcrypt.hash(req.body.password, 12);
		const newUser = userModel({ ...req.body, password: hashedPassword });

		return newUser
			.save()
			.then((savedUser) => {
				const { password, ...userWithoutPassword } = savedUser.toObject();
				return res.json({ success: true, data: userWithoutPassword });
			})
			.catch((err) => {
				logger("error", __filename, "while saving", err);
				return res
					.status(INTERNAL_SERVER_ERROR_CODE)
					.json({ success: false, msg: INTERNAL_SERVER_ERROR });
			});
	} catch (err) {
		logger("error", __filename, "", err);
		return res
			.status(INTERNAL_SERVER_ERROR_CODE)
			.json({ success: false, msg: INTERNAL_SERVER_ERROR });
	}
};

module.exports = { postUser };
