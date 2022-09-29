import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import logMiddleware from "./log.js";
import homeRouter from "./Routers/home.js";
import apiRouter from "./Routers/api.js";
import slackRouter from "./Routers/slack.js";
import testRouter from "./Routers/test.js";
import errorMiddleware from "./error.js";
import router from "./Routers/home.js";
import { schedule } from "./schedule.js";

dotenv.config();
schedule.loadLocations(process.env.LOAD_LOCATION_PERIOD);
const app = express();
app.use(bodyParser.json());
app.use(logMiddleware);
app.use("/", homeRouter);
app.use("/api", apiRouter);
app.use("/slack", slackRouter);
if (process.env.DEV_MODE) {
	app.use("/test", testRouter);
}
app.use(errorMiddleware);

app.listen(process.env.PORT || 3000);
