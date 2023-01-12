import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import logMiddleware from "./Middleware/log.js";
import homeRouter from "./Middleware/Routers/home.js";
import apiRouter from "./Middleware/Routers/api.js";
import slackRouter from "./Middleware/Routers/slack.js";
import auth42Router from "./Middleware/Routers/auth42.js";
import errorMiddleware from "./Middleware/error.js";
import { schedule } from "./api/42/schedule.js";

dotenv.config();
schedule.loadLocations(process.env.LOAD_LOCATION_PERIOD_SEC);
schedule.statisticHost(process.env.STATISTIC_HOST_PERIOD_HOUR);
const app = express();

app.use(bodyParser.json());
app.use(logMiddleware);
app.use("/", homeRouter);
app.use("/api", apiRouter);
app.use("/slack", slackRouter);
app.use("/login/42", auth42Router);
app.use(errorMiddleware);

app.listen(process.env.PORT || 4200);
