import dotenv from "dotenv";
import app from "express";
import session from "express-session";
import passport from "passport";
import passport42 from "passport-42";
import {registerNewClient} from "../DataBase/utils.js"
import { clientSlackId } from "../slack/Main.js";

var FortyTwoStrategy = passport42.Strategy;
dotenv.config();
passport.use(new FortyTwoStrategy({
	clientID: process.env.OAUTH42_CLIENT_ID,
	clientSecret: process.env.OAUTH42_CLIENT_SECRET,
	callbackURL: process.env.OAUTH42_RETURN_URL
  },
	function (accessToken, refreshToken, profile, cb) {
	//   console.log('accessToken', accessToken, 'refreshToken', refreshToken);
	// console.log(profile.username);
	registerNewClient(profile.username, clientSlackId);
	  return cb(null, profile);
	})
);
passport.serializeUser(function (user, cb) {
	cb(null, user);
  });
  
  passport.deserializeUser(function (obj, cb) {
	cb(null, obj);
  });

const router = app.Router();
router.use(session({ resave: false, saveUninitialized: false, secret: '!Seoul' }));
router.use(passport.initialize());
router.use(passport.session());
router.get("/", passport.authenticate('42'));
router.get('/return',
  passport.authenticate('42', { failureRedirect: '/login' }),
  function (req, res) {
    res.redirect('/');
  });


export default router;
