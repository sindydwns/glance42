import dotenv from "dotenv";
import pkg from "@slack/bolt";
import pageHome from "./slack/pageHome.js";
import { WebClient } from "@slack/web-api";

const { App, LogLevel } = pkg;
dotenv.config();
const web = new WebClient(process.env.SLACK_TOKEN);
const app = new App({
    token: process.env.SLACK_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
    port: process.env.PORT || 3000,
    logLevel: process.env.SLACK_DEBUG_LEVEL || LogLevel.INFO,
});

pageHome(app);

/**
 * post direct message to user
 * @param {string} users example XXXXXXXXXXX, XXXXXXXXXXX, XXXXXXXXXXX...
 * @param {string} text 
 */
export async function postDM2User(users, text) {
	return await errorHandler(async () => {
		const conversation = await web.conversations.open({users})
		if (!conversation.ok)
			throw new SlackError("conversation open failed");
		const channel = conversation.channel.id;
		return await web.chat.postMessage({channel, text});
	});
}

(async () => {
    await app.start();
    console.log("⚡️ Bolt app is running!");
})();

export default app;
