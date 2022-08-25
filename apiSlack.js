import dotenv from "dotenv";
import { WebClient } from "@slack/web-api";

dotenv.config();
const web = new WebClient(process.env.SLACK_TOKEN);

async function errorHandler(fn) {
	try {
		return await fn()
	} catch(e) {throw new SlackError(e);}
}

export default web;

export async function getUserList() {
	return await errorHandler(async () => web.users.list());
}

/**
 * post direct message to user
 * @param {string} userId 
 * @param {string} text 
 */
export async function postDM(users, text) {
	return await errorHandler(async () => {
		const conversation = await web.conversations.open({users})
		if (!conversation.ok)
			throw new SlackError("conversation open failed");
		const channel = conversation.channel.id;
		return await web.chat.postMessage({channel, text});
	});
}

export class SlackError extends Error {
	constructor(originError, ...params) {
		super(...params);
		this.originError = originError;
	}
}