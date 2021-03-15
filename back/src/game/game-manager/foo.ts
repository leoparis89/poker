import { Socket } from "socket.io";
import { Game } from "../game/Game";
import errorMessages from "../../../../common/errorMessages";

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
      throw new Error(errorMessages.GAME_NOT_FOUND);
    }
    gameToJoin.connect(socket);
  }
}

export const gameManager = new GameManager();
