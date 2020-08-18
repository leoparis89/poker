import express, { Router } from "express";
import expressSession from "express-session";
import http from "http";
import { authGuard } from "./authGuard";
import { router } from "./game/gameRoute";
import passport from "./passport";
import { settings } from "./settings";

const {
  port,
  version,
  oAuth: { redirectUrl }
} = settings;
const session = expressSession({
  secret: "coconut",
  resave: true,
  saveUninitialized: true
});
const app = express();

app.use(require("cookie-parser")());
app.use(require("body-parser").urlencoded({ extended: true }));

export const myMiddleWare = Router().use(
  session,
  passport.initialize(),
  passport.session()
);

app.use(myMiddleWare);

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.cookie("loggedIn", true);
    res.redirect(redirectUrl);
  }
);

const root = "/api";

app.get(root + "/connect/:id", function (req, res) {
  res.send(req.params.id);
});

app.use("/game", router);

app.get("/profile", authGuard, (req, res) => {
  res.send(req.user);
});

app.get("/healthcheck", (req, res) => {
  res.json(`Poker v${version} is listening on port ${port}`);
});
/**
 * serve static front end files
 */
app.use(express.static(__dirname + "/../front"));
app.use((req, res) => {
  var path = require("path");
  res.sendFile(path.resolve(__dirname + "/../front/index.html"));
});

export const server = http.createServer(app);
