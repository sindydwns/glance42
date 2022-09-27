import dotenv from "dotenv";
import { WebClient } from "@slack/web-api";
import pkg from "@slack/bolt";

const { App } = pkg;
dotenv.config();
const web = new WebClient(process.env.SLACK_TOKEN);
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true, // add this
    appToken: process.env.SLACK_APP_TOKEN, // add this
    port: process.env.PORT || 3000,
});

app.message("hello", async ({ message, say }) => {
    // say() sends a message to the channel where the event was triggered
    await say({
        blocks: [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `Hey there <@${message.user}>!`,
                },
                accessory: {
                    type: "button",
                    text: {
                        type: "plain_text",
                        text: "Click Me",
                    },
                    action_id: "button_click",
                },
            },
        ],
        text: `Hey there <@${message.user}>!`,
    });
});

app.action("button_click", async ({ body, ack, say }) => {
    // Acknowledge the action
    await ack();
    await say(`<@${body.user.id}> clicked the button`);
});

(async () => {
    // Start your app
    await app.start();

    console.log("⚡️ Bolt app is running!");
})();

async function errorHandler(fn) {
    try {
        return await fn();
    } catch (e) {
        throw new SlackError(e);
    }
}

export default web;

/**
 * post direct message to user
 * @param {string} userId example XXXXXXXXXXX
 * @param {string} text
 */
export async function postDM2User(users, text) {
    return await errorHandler(async () => {
        const conversation = await web.conversations.open({ users });
        if (!conversation.ok) throw new SlackError("conversation open failed");
        const channel = conversation.channel.id;
        return await web.chat.postMessage({ channel, text });
    });
}

export async function postDM2Channel(channel, text) {
    return await errorHandler(async () => {
        return await web.chat.postMessage({ channel, text });
    });
}

/**
 * add reaction to message
 * @param {string} channel
 * @param {string} ts
 * @param {string} name
 * @returns
 */
export async function reactDM(channel, ts, name) {
    return await errorHandler(async () => {
        return await web.reactions.add({
            channel,
            name,
            timestamp: ts,
        });
    });
}

export class SlackError extends Error {
    constructor(originError, ...params) {
        super(...params);
        this.originError = originError;
    }
}
