import { postDM2User, postDM2Channel, reactDM } from "../apiSlack.js";

export default [
	{
		commands: ["aon"],
		action: (req, res, next) => {
			const channel = req.body.event.channel;
			postDM2Channel(channel, "aon");
			res.sendStatus(200);
			if (false)
				next({log:"input error message", dm:"input dm for user"});
		}
	},
	{
		commands: ["aoff"],
		action: (req, res, next) => {
			const channel = req.body.event.channel;
			postDM2Channel(channel, "aoff");
			res.sendStatus(200);
			if (false)
				next({log:"input error message", dm:"input dm for user"});
		}
	},
	{
		commands: ["als"],
		action: (req, res, next) => {
			const channel = req.body.event.channel;
			postDM2Channel(channel, "als");
			res.sendStatus(200);
			if (false)
				next({log:"input error message", dm:"input dm for user"});
		}
	}
];
