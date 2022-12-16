import dotenv from "dotenv";
import app from "express";
import session from "express-session";
import passport from "passport";
import passport42 from "passport-42";
import { registerNewClient } from "../DataBase/utils.js";
import { decrypt } from "../utils.js";

const FortyTwoStrategy = passport42.Strategy;

dotenv.config();
passport.use(
  new FortyTwoStrategy(
    {
      clientID: process.env.OAUTH42_CLIENT_ID,
      clientSecret: process.env.OAUTH42_CLIENT_SECRET,
      callbackURL: process.env.OAUTH42_RETURN_URL,
    },
    async function (accessToken, refreshToken, profile, cb) {
      if (profile == null) {
        return cb("error", null);
      }
      return cb(null, profile.username);
    }
  )
);

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

const router = app.Router();

router.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.API_FT_SECRET,
  })
);
router.use(passport.initialize());
router.use(passport.session());
router.get("/", (req, res, next) => {
  const passportOptions = { state: req.query.guess };

  passport.authenticate("42", passportOptions)(req, res, next);
});
const passportOptions = { failureRedirect: "/login" };

router.get(
  "/return",
  passport.authenticate("42", passportOptions),
  async (req, res) => {
    const slackId = decrypt(req.query.state);
    const intraId = req.user;

    await registerNewClient(intraId, slackId);
    res.redirect("/");
  }
);

export default router;
