import { GameData } from "../../../common/models";
import { allButOneFolded } from "./actionHandlers";
import { UserGameData } from "./models";

export const gameStarted = (game: GameData) =>
  !game.users.every(u => u.hand === null);

export const gameIsOver = (game: GameData) => {
  return game.flop?.length === 5 || allButOneFolded(game.users);
};

export const isSmallBlind = (gameData: GameData) =>
  isPreflop(gameData) && gameData.users.every(d => d.bet === null);

export const isBigBlind = (gameData: GameData) =>
  isPreflop(gameData) &&
  gameData.users.filter(d => d.bet !== null).length === 1;

export const isPreflop = (gameData: GameData) => {
  return gameData.flop === null;
};
