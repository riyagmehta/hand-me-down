import formidable from "formidable";
import dbConnect from "../../lib/dbConnect";
import { uploadFileToCDN } from "../../lib/cloudinary";

export const config = {
	api: {
		bodyParser: false,
	},
};

const formidableConfig = {
	keepExtensions: true,
	// maxFileSize: 10_000_000,
	// maxFieldsSize: 10_000_000,
	// maxFields: 2,
	allowEmptyFiles: false,
	multiples: true,
	uploadDir: __dirname,
};

const uploadFiles = async (req, res) => {
	const form = formidable(formidableConfig);
	form.parse(req, async (err, fields, files) => {
		const uploadedFiles = await Promise.all(
			files.image.map(async (file) => {
				return uploadFileToCDN(file.filepath);
			})
		);
		return res.json({ uploadedFiles, fields, err });
	});
};

export default async function handler(req, res) {
	const { method } = req;
	await dbConnect();

	switch (method) {
		case "GET":
			return res.json({ msg: "Wokring root" });
			break;
		case "POST":
			return uploadFiles(req, res);
			break;
	}
}
