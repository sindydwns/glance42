import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.get("/", (req, res) => {
	res.json({say:"hello express"});
});

app.listen(process.env.PORT || 3000);
