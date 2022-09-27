import { postDM2User, postDM2Channel, reactDM } from "../apiSlack.js";

export default [
	{
		commands: ["gls"],
		action: (req, res, next) => {
			const channel = req.body.event.channel;
			postDM2Channel(channel, "gls");
			res.sendStatus(200);
			if (false)
				next({log:"input error message", dm:"input dm for user"});
		}
	},
	{
		commands: ["ls"],
		action: (req, res, next) => {
			const channel = req.body.event.channel;
			postDM2Channel(channel, "ls");
			res.sendStatus(200);
			if (false)
				next({log:"input error message", dm:"input dm for user"});
		}
	},
];
