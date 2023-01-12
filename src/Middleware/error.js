export default (err, req, res, next) => {
	console.error(err);
	res.sendStatus(500);
};
