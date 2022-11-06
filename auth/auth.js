import passport from "passport";
import passport42 from "passport-42";
const FortyTwoStrategy = passport42.Strategy;

passport.use(
    new FortyTwoStrategy(
        {
            clientID: process.env.API_FT_UID,
            clientSecret: process.env.API_FT_SECRET,
            callbackURL: process.env.RETURN_URL,
        },
        function (accessToken, refreshToken, profile, cb) {
            console.log("accessToken", accessToken, "refreshToken", refreshToken);
            return cb(null, profile);
        }
    )
);
passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});
