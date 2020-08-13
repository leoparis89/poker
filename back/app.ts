import express, { Response, Router } from "express";
import { authGuard } from "./authGuard";
import { router } from "./game/gameRoute";
import passport from "./passport";
import http from "http";
import Socket from "socket.io";
import expressSession from "express-session";

const session = expressSession({
  secret: "coconut",
  resave: true,
  saveUninitialized: true
});
const app = express();

app.use(require("cookie-parser")());
app.use(require("body-parser").urlencoded({ extended: true }));

const myMiddleWare = Router().use(
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

const io = Socket.listen(server)
  .use((socket, next) => {
    myMiddleWare(socket.request, {} as Response, next);
  })
  .use((socket, next) => {
    const isAuth = socket.request.isAuthenticated();
    if (!isAuth) {
      socket.send("unauthorized");
      socket.disconnect();
      return;
    }
    next();
  });

io.on("connection", socket => {
  console.log(`User ${socket.request.user.id} has connected.`);
  socket.on("disconnect", () => {
    debugger;
  });
  socket.on("joinGame", id => {
    debugger;
  });
  // var cookief = cookie.parse(socket.handshake.headers.cookie);
});
