import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";

import { usersDb } from "./mockDb";
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
      callbackURL: "http://localhost:3000/auth/google/callback"
    },
    function (accessToken, refreshToken, profile, cb) {
      usersDb[profile.id] = profile;
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

passport.deserializeUser(function (id: number, done) {
  done(undefined, usersDb[id]);
});

export default passport;
