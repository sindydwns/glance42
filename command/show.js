import { postDM2User, postDM2Channel, reactDM } from "../apiSlack.js";

export default [
	{
		commands: ["show"],
		action: (req, res, next) => {
			const channel = req.body.event.channel;
			postDM2Channel(channel, "show");
			res.sendStatus(200);
			if (false)
				next({log:"input error message", dm:"input dm for user"});
		}
	},
	{
		commands: ["showgroup"],
		action: (req, res, next) => {
			const channel = req.body.event.channel;
			postDM2Channel(channel, "showgroup");
			res.sendStatus(200);
			if (false)
				next({log:"input error message", dm:"input dm for user"});
		}
	},
];
