import app from "express";
import api42 from "../api42.js";

const router = app.Router();
router.get("/:user_id/location", async (req, res, next) => {
	const userId = req.params.user_id;
	const path = `/v2/users/${userId}/locations`;
	const config = {params:{"page[size]":1}};
	try {
		const data = await api42("GET", path, config);
		const lastLocation = data[0];
		const user = lastLocation?.user;
		res.json({
			last: lastLocation?.host,
			current: user?.location,
		});
	} catch(e) {next(e);}
});

export default router;
