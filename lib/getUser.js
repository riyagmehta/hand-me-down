import { getCookies } from "cookies-next";

const getUser = () => {
	const { email, name } = getCookies();
	return { email: decodeURI(email), name: name };
};

export default getUser;
