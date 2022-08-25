import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import homeRouter from "./Routers/home.js";
import apiRouter from "./Routers/api.js";
import testRouter from "./Routers/test.js";
import errorMiddleware from "./error.js";

dotenv.config();
const app = express();
app.use(bodyParser.json())

app.use("/", homeRouter);
app.use("/api", apiRouter);
if (process.env.DEV_MODE) {
	app.use("/test", testRouter);
}
app.use(errorMiddleware);

app.listen(process.env.PORT || 3000);
