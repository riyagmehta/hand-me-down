const logger = (type, filename, title, msg) => {
	console.log(type, " in : ", filename);
	console.log(title, " >> ", msg);
};

module.exports = { logger };
