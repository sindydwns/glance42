import app from "express";

const router = app.Router();
router.get("/", (req, res, next) => {
	res.sendStatus(200);
});

export default router;
