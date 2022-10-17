import app from "express";

const router = app.Router();
router.get("/", (req, res, next) => {
	res.send('<h1>HomePage입니다.</h1>');
	// res.sendStatus(200);
});

export default router;
