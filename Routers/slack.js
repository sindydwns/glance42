import app from "express";
import { postDM2User, postDM2Channel, reactDM } from "../apiSlack.js";
import alarm from "../command/alarm.js";
import groupDB from "../command/groupDB.js";
import ls from "../command/ls.js";
import show from "../command/show.js";

function commandMatch(commands, middleware) {
	if ((commands instanceof Array) == false)
		commands = [commands];
	return (req, res, next) => {
		try {
			if (commands.includes(req.glance.commandArr[0]))
				middleware(req, res, next);
			else
				next();
		} catch(e) {
			next({log:"not defined error", dm:"system error"});
		}
	};
}

const router = app.Router();
router.post("/", (req, res, next) => {
	try {
		const json = req.body;
		if (json.challenge) res.json({ challenge: json.challenge });
		else next();
	} catch (e) {
		next({log:e});
	}
}, (req, res, next) => {
	const isUserMessage = req.body?.event?.client_msg_id;
	if (isUserMessage) next();
	else res.sendStatus(200);
}, (req, res, next) => {
	const text = req.body?.event?.text;
	if (text == null) {
		next({log:"no text", dm:"no text"});
		return;
	}
	console.log(`run command: ${text}`);
	req.glance = {};
	req.glance.commandArr = text.split(" ");
	req.glance.channel = req.body.event.channel;
	next();
});
const commands = [show, ls, groupDB, alarm].flat();
router.post("/", commands.map(x => commandMatch(x.commands, x.action)));
router.post("/", (req, res, next) => {next({log:"not found command", dm:"not found command"});});
router.use("/", (err, req, res, next) => {
	try {
		if (err.log)
			console.error(`run command error: ${err.log}`);
		if (err.dm && req.glance.channel)
			postDM2Channel(req.glance.channel, err.dm);
		res.sendStatus(200);
	} catch (e) {next(e)}
});

export default router;
