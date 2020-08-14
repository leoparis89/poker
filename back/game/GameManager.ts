import { Socket } from "socket.io";
import { Game } from "./Game";

export class GameManager {
  activeGames = new Map<string, Game>();

  create(creatorId: string) {
    const game = new Game(creatorId);
    this.activeGames.set(game.id, game);
    return game;
  }

  connect(gameId, socket: Socket) {
    const gameToJoin = this.activeGames.get(gameId);
    if (!gameToJoin) {
      throw new Error(`Game with id:${gameId} doesn't exist.`);
    }
    gameToJoin.connect(socket);
    return gameToJoin;
  }

  disconnectFromALlGames(socket: Socket) {
    this.activeGames.forEach(game => {});
  }
}

export const gameManager = new GameManager();
