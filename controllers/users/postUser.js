const {
	INTERNAL_SERVER_ERROR_CODE,
	INTERNAL_SERVER_ERROR,
} = require("../../constants/constants");
const { logger } = require("../../debugger/logger");
const userModel = require("../../models/user.model");

const postUser = async (req, res) => {
	try {
		const newUser = userModel(req.body);

		newUser
			.save()
			.then((savedUser) => {
				return res.json({ success: true, data: savedUser });
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
