import express, { Response, Router } from "express";
import expressSession from "express-session";
import http from "http";
import Socket from "socket.io";
import { authGuard } from "./authGuard";
import { gameManager } from "./game/GameManager";
import { router } from "./game/gameRoute";
import passport from "./passport";

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
    res.redirect("http://localhost:4000/home");
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

export const server = http.createServer(app);
