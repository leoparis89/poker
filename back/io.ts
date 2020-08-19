import { Response } from "express";
import Socket from "socket.io";
import { myMiddleWare, server } from "./app";
import { gameManager } from "./game/GameManager";
import { ChatMessage } from "../common/interfaces";

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

    socket.on("chat-send", text => {
      const chatMessage: ChatMessage = {
        date: Date.now(),
        text,
        userId: socket.request.user.id
      };

      gameManager.activeGames
        .get(gameId)
        ?.broadcast("chat-receive", chatMessage);
    });

    socket.on("disconnect", () => {
      gameManager.activeGames.get(gameId)?.disconnect(socket);
    });
  });
});
