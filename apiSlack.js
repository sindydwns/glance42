import dotenv from "dotenv";
import pkg from "@slack/bolt";
import pageHome from "./slack/pageHome.js";

const { App, LogLevel } = pkg;
dotenv.config();
const app = new App({
    token: process.env.SLACK_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
    port: process.env.PORT || 3000,
    logLevel: process.env.SLACK_DEBUG_LEVEL || LogLevel.INFO,
});

pageHome(app);

(async () => {
    await app.start();
    console.log("⚡️ Bolt app is running!");
})();

export default app;
