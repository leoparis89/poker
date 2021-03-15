import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import passport from "passport";

import { usersDb } from "./db/users";
import { settings } from "./settings";

const {
  oAuth: { clientID, clientSecret, callbackURL }
} = settings;

passport.use(
  new GoogleStrategy(
    {
      clientID,
      clientSecret,
      callbackURL
    },
    function (accessToken, refreshToken, profile, cb) {
      usersDb.set(profile);
      cb(undefined, profile);
      //   User.findOrCreate({ googleId: profile.id }, function (err, user) {
      //     return cb(err, user);
      //   })
    }
  )
);

passport.serializeUser(function (user: any, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id: string, done) {
  done(undefined, usersDb.get(id));
});

export default passport;
