import { Socket } from "socket.io";
import { GameManager } from "../GameManager";

export const handleJoinGame = (socket: Socket, gameManager: GameManager) => (
  gameId: string
) => {
  try {
    gameManager.connect(gameId, socket);
  } catch (error) {
    socket.emit("join-failure", error.message);
  }
};