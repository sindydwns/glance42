import { channel } from "diagnostics_channel";
import app from "express";

import api42 from "../api42.js";
import { postDM2User, postDM2Channel, reactDM } from "../apiSlack.js";

const router = app.Router();

router.get("/:user_id/location", async (req, res, next) => {
	const userId = req.params.user_id;
	const path = `/v2/users/${userId}/locations`;
	const config = {params:{"page[size]":1}};
	try {
		const data = await api42("GET", path, config);
		const lastLocation = data[0];
		const user = lastLocation?.user;
		res.json(data);
	} catch(e) {next(e);}
});

let last = null;
router.get("/campus", async (req, res, next) => {
	const userId = req.params.user_id;
	const campusId = 29;
	const path = `/v2/campus/${campusId}/locations`;
	try {
		let total = [];
		const now = new Date();
		const begin = last ?? new Date(now - (1000 * 60 * 60 * 24));
		for (let i = 0; i < 20; i++) {
			const config = {params:{
				"page[size]": "100",
				"page[number]": i + 1,
				// "range[begin_at]": `${begin.toISOString()},${now.toISOString()}`,
				"filter[active]": true,
				"filter[primary]": true,
				"range[host]": "c10,c9r9s9"
			}};
			const data = await api42("GET", path, config);
			if (data.length == 0)
				break;
			total = [...total, ...data];
		}
		last = now;
		total = total.map(x => ({
			userId: x.user.login,
			host: x.host,
			begin_at: x.begin_at,
		}))
		// res.json(total.map(x => ({host:x.host, user:x.user.id, user_id:x.user.login, begin: x.begin_at, end: x.end_at})));
		res.json({len:total.length, total});
	} catch(e) {next(e);}
});

router.get("/userInfo/:user_id", async(req, res, next) => {
    try {
        const userId = req.params.user_id;
        const path = `/v2/users/${userId}`;
        const data = await api42("GET", path);
        res.json(data);
    } catch(e) {
        const errorMsg = e.originError.response.statusText;
        if(errorMsg)
            next(errorMsg);
        else
            next(e);
    }
})

router.get("/campus", async (req, res, next) => {
    const campusId = 29;
    const path = `/v2/campus/${campusId}/locations`;
    try {
        // getUserInfo(id);
        let arr = [];
        for (let i = 0; i < 4; i++) {
            const config = {
                params: {
                    "page[size]": "100",
                    "page[number]": i + 1,
                    "filter[active]": true,
					"filter[primary]" : true,
					"range[host]" : "c10,c9r9s9",
					"sort" : "host"
                },
            };
            const data = await api42("GET", path, config);
            arr = [...arr, ...data];
        }
        res.json(arr);
    } catch (e) {
        next(e);
    }
});

router.get("/:user_id/post", async (req, res, next) => {
    try {
        const userId = req.params.user_id;
        const result = await postDM2User(userId, "Hello Slack");
        res.json(result);
    } catch (e) {
        next(e);
    }
});

router.post(
    "/dm",
    async (req, res, next) => {
        try {
            const json = req.body;
            if (json.challenge) res.json({ challenge: json.challenge });
            else next();
        } catch (e) {
            next(e);
        }
    },
    async (req, res, next) => {
        const isUserMessage = req.body?.event?.client_msg_id;
        if (isUserMessage) next();
        else res.sendStatus(400);
    },
    async (req, res, next) => {
        const o = req.body.event;
        const text = o.text;
        if (text.startsWith("add")) {
            // TODO
        } else if (text.startsWith("remove")) {
            await reactDM(o.channel, o.ts, "white_check_mark");
        } else if (text.startsWith("show")) {
            if (text.trim() === "show") {
                // TODO: response all added user loction;
            } else {
                const userId = text.split(/\s+/g)[1];
                const path = `/v2/users/${userId}/locations`;
                const config = { params: { "page[size]": 1 } };
                try {
                    const data = await api42("GET", path, config);
                    const lastLocation = data[0];
                    const user = lastLocation?.user;
                    if (user) await postDM2Channel(o.channel, user.location ?? "nope.");
                    else await postDM2Channel(o.channel, "sorry, i can not found");
                } catch (e) {
                    next(e);
                }
            }
        } else {
            await postDM2Channel(o.channel, "sorry. that's wrong command");
        }
        res.sendStatus(200);
    }
);

router.post("/dm", async (req, res, next) => {
    try {
        const json = req.body;
        if (json.challenge) {
            res.json({ challenge: json.challenge });
            return;
        }
        if (json?.event?.client_msg_id) {
            const o = json.event;
            await reactDM(o.channel, o.ts, "white_check_mark");
            await postDM2Channel(o.channel, `${o.text}`);
        }
        res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});

export default router;
