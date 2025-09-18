const logoutUser = async (req, res) => {
	if (req.session) req.session.destroy();
	else {
		console.log("No user is logged in");
	}
	return res.json({ success: true });
};

module.exports = { logoutUser };
