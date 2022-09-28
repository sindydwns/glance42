import app from "express";
import slackApp from "../apiSlack.js";

const router = app.Router();
router.post("/", (req, res, next) => {
	try {
		const json = req.body;
		if (json.challenge) res.json({ challenge: json.challenge });
		else next();
	} catch (e) {
		next({log:e});
	}
});

export default router;
