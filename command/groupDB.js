import { postDM2User, postDM2Channel, reactDM } from "../apiSlack.js";

export default [
	{
		commands: ["create"],
		action: (req, res, next) => {
			const channel = req.body.event.channel;
			postDM2Channel(channel, "create");
			res.sendStatus(200);
			if (false)
				next({log:"input error message", dm:"input dm for user"});
		}
	},
	{
		commands: ["drop"],
		action: (req, res, next) => {
			const channel = req.body.event.channel;
			postDM2Channel(channel, "drop");
			res.sendStatus(200);
			if (false)
				next({log:"input error message", dm:"input dm for user"});
		}
	},
	{
		commands: ["add"],
		action: (req, res, next) => {
			const channel = req.body.event.channel;
			postDM2Channel(channel, "add");
			res.sendStatus(200);
			if (false)
				next({log:"input error message", dm:"input dm for user"});
		}
	},
	{
		commands: ["del"],
		action: (req, res, next) => {
			const channel = req.body.event.channel;
			postDM2Channel(channel, "del");
			res.sendStatus(200);
			if (false)
				next({log:"input error message", dm:"input dm for user"});
		}
	},
];
