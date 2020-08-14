import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import passport from "passport";

import { usersDb } from "./db/users";
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
      callbackURL: "http://localhost:3000/auth/google/callback"
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
