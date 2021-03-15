import express, { Router } from "express";
import expressSession from "express-session";
import http from "http";
import { authGuard } from "./authGuard";
import { router } from "./game/gameRoute";
import passport from "./passport";
import { settings } from "./settings";
import appRoot from 'app-root-path'
import path from 'path'

const {
  port,
  version,
  oAuth: { redirectUrl },
} = settings;
const session = expressSession({
  secret: "coconut",
  resave: true,
  saveUninitialized: true,
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

app.get("/auth/google", (req, res, next) => {
  const { gameId } = req.query;

  passport.authenticate("google", {
    scope: ["profile"],
    state: JSON.stringify({ gameId }),
  })(req, res, next);
});

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.cookie("loggedIn", true);
    const { state } = req.query;
    const gameId = typeof state === "string" && JSON.parse(state).gameId;

    if (gameId) {
      res.redirect(redirectUrl + "/game/" + gameId);
      return;
    }
    res.redirect(redirectUrl + "/home");
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
app.use(express.static(appRoot + "/front/dist"));
app.use((req, res) => {
  res.sendFile(
    path.resolve(appRoot + "/front/dist/index.html")
  );
});

export const server = http.createServer(app);
