import dotenv from "dotenv";
import pkg from "@slack/bolt";
import { WebClient } from "@slack/web-api";
import pageMain from "./slack/Main.js";
import pageGroupManage from "./slack/GroupManage.js";
import pageAlarmManage from "./slack/AlarmManage.js";
import pageMemberManage from "./slack/MemberManage.js";

const { App, LogLevel } = pkg;

dotenv.config();
const web = new WebClient(process.env.SLACK_TOKEN);
const app = new App({
	token: process.env.SLACK_TOKEN,
	signingSecret: process.env.SLACK_SIGNING_SECRET,
	socketMode: true,
	appToken: process.env.SLACK_APP_TOKEN,
	port: process.env.PORT || 3000,
	logLevel: process.env.SLACK_DEBUG_LEVEL || LogLevel.LOG,
});

pageMain(app);
pageGroupManage(app);
pageMemberManage(app);
pageAlarmManage(app);

app.message("me", async ({ message, say }) => {
	say(`${message.user}`);
});

/**
 * post direct message to user
 * @param {string} users example XXXXXXXXXXX, XXXXXXXXXXX, XXXXXXXXXXX...
 * @param {string} text
 */
export async function postDM2User(users, text) {
	const conversation = await web.conversations.open({ users });

	if (!conversation.ok) throw new SlackError("conversation open failed");
	const channel = conversation.channel.id;

	return await web.chat.postMessage({ channel, text });
}

(async () => {
	await app.start();
	console.log("⚡️ Bolt app is running!");
})();

export default app;
