export default (req, res, next) => {
  const reqUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

  console.log(`[${req.method}] ${reqUrl}`);
  next();
};
