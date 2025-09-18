const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Configuration
cloudinary.config({
	cloud_name: process.env.CDN_CLOUD_NAME,
	api_key: process.env.CDN_API_KEY,
	api_secret: process.env.CDN_API_SECRET,
});

const uploadFileToCDN = async (filepath) => {
	console.log("uploading >> ", filepath);
	return cloudinary.uploader
		.upload(filepath, { folder: "multiuploads" })
		.then((result) => {
			fs.unlinkSync(filepath);
			return result.url;
			// return {
			// 	url: result.url,
			// };
		})
		.catch((err) => {
			console.log("uploading err >> ", err);
			return "";
		});
};

module.exports = { cloudinary, uploadFileToCDN };
