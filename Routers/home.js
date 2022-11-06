import app from "express";

const router = app.Router();
router.get("/", (req, res, next) => {
	res.send('<h1>glance42 서비스 이용을 위한 인증이 완료되었습니다.</h1><h2><br>이제부터 염탐이 가능합니다. 와!</h2>');
	// res.sendStatus(200);
});

export default router;
