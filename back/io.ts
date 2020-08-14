import { Response } from "express";
import Socket from "socket.io";
import { myMiddleWare, server } from "./app";
import { gameManager } from "./game/GameManager";

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
  socket.on("joinGame", (gameId: string) => {
    gameManager.connect(gameId, socket);
    socket.on("disconnect", () => {
      gameManager.activeGames.get(gameId)?.disconnect(socket);
    });
  });
});
