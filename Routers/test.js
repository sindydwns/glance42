import { channel } from "diagnostics_channel";
import app from "express";
import api42 from "../api42.js";
import { postDM, reactDM } from "../apiSlack.js";

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

router.get("/:user_id/post", async (req, res, next) => {
	try {
		const userId = req.params.user_id;
		const result = await postDM(userId, "Hello Slack");
		res.json(result);
	} catch(e) {next(e);}
})

router.post("/dm", async (req, res, next) => {
	try {
		const json = req.body;
		if (json.challenge) {
			res.json({challenge:json.challenge});
			return;
		}
		if (json?.event?.client_msg_id) {
			const o = json.event;
			await reactDM(o.channel, o.ts, "white_check_mark");
			await postDM(o.user, `${o.text}`);
		}
		res.sendStatus(200);
	} catch(e) {next(e);}	
});

export default router;
