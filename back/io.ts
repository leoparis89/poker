import { Response } from "express";
import Socket from "socket.io";
import { myMiddleWare, server } from "./app";
import { socketManager } from "./game/SocketManager";
import { UserSocket } from "./interfaces";
import { handleJoinGame } from "./game/socket-handlers/handleJoinGame";
import { gameManager } from "./game/GameManager";

const io = Socket.listen(server)
  .use((socket, next) => {
    myMiddleWare(socket.request, {} as Response, next);
  })
  .use((socket: UserSocket, next) => {
    const isAuth = socket.request.isAuthenticated();

    if (!isAuth) {
      socket.send("unauthorized");
      socket.disconnect();
      return;
    }
    next();
  });

const handleConnection = (socket: Socket.Socket) => {
  socketManager.addSocket(socket);
  socket.on("joinGame", handleJoinGame(socket, gameManager));
};

io.on("connection", handleConnection);
