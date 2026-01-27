const {
	INTERNAL_SERVER_ERROR_CODE,
	INTERNAL_SERVER_ERROR,
	INVALID_REQUEST_DATA_CODE,
	INVALID_REQUEST_DATA,
} = require("../../constants/constants");
const { logger } = require("../../debugger/logger");
const userModel = require("../../models/user.model");
const mongoose = require("mongoose");

import formidable from "formidable";
import { uploadFileToCDN } from "../../lib/cloudinary";

const formidableConfig = {
	keepExtensions: true,
	// maxFileSize: 10_000_000,
	// maxFieldsSize: 10_000_000,
	// maxFields: 2,
	allowEmptyFiles: false,
	multiples: false,
	uploadDir: __dirname,
};

const updateUser = async (req, res) => {
	const { uid } = req.query;
	const form = formidable(formidableConfig);
	let userData = {};

	form.parse(req, async (err, fields, files) => {
		const { user } = fields;
		const { avatar } = files;
		userData = JSON.parse(user);
		let avatarURL = "";
		if (avatar) {
			avatarURL = await uploadFileToCDN(avatar.filepath);
			console.log("avurl >> ", avatarURL);
		} else {
			console.log("no avatar found");
		}

		if (!mongoose.isValidObjectId(uid))
			return res.status(INVALID_REQUEST_DATA_CODE).json({
				success: false,
				msg: INVALID_REQUEST_DATA,
				action: "uid Validation",
			});

		console.log("userData >> ", userData);

		const {
			firstName,
			middleName,
			lastName,
			gender,
			dateOfBirth,
			email,
			phoneNumber,
			address,
		} = userData;

		try {
			const updatedUser = await userModel.findOneAndUpdate(
				{ _id: uid },
				{
					firstName,
					middleName,
					lastName,
					gender,
					dateOfBirth,
					email,
					phoneNumber,
					address,
					avatarURL: avatarURL,
				},
				{ new: true }
			);

			if (!updatedUser) {
				return res.status(INVALID_REQUEST_DATA_CODE).json({
					success: false,
					msg: INVALID_REQUEST_DATA,
					action: "Searching User",
				});
			}

			return res.json({
				success: true,
				data: updatedUser,
			});
		} catch (err) {
			logger("error", __filename, "", err);
			return res
				.status(INTERNAL_SERVER_ERROR_CODE)
				.json({ success: false, msg: INTERNAL_SERVER_ERROR });
		}
	});

	// return res.json({ msg: "could not prase" });
};

module.exports = { updateUser };
