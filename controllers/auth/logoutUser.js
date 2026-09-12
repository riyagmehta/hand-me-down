const { deleteCookie } = require("cookies-next");

const logoutUser = async (req, res) => {
	deleteCookie("token", { req, res });
	deleteCookie("email", { req, res });
	deleteCookie("name", { req, res });
	return res.json({ success: true });
};

module.exports = { logoutUser };
