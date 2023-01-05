import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import logMiddleware from "./log.js";
import homeRouter from "./Routers/home.js";
import apiRouter from "./Routers/api.js";
import slackRouter from "./Routers/slack.js";
import testRouter from "./Routers/test.js";
import auth42Router from "./Routers/auth42.js";
import errorMiddleware from "./error.js";
import { schedule } from "./Schedule/schedule.js";

dotenv.config();
schedule.loadLocations(process.env.LOAD_LOCATION_PERIOD_SEC);
schedule.statisticHost(process.env.STATISTIC_HOST_PERIOD_HOUR)
const app = express();
app.use(bodyParser.json());
app.use(logMiddleware);
app.use("/", homeRouter);
app.use("/api", apiRouter);
app.use("/slack", slackRouter);
if (process.env.DEV_MODE) {
	app.use("/test", testRouter);
}
app.use('/login/42', auth42Router);
app.use(errorMiddleware);

app.listen(process.env.PORT || 4200);
