import { Move, Action, GameDataCore } from "./models";
import { newGame } from "./actionHandlers";
import { gameReducer } from "./gameReducer.";

export const toAction = (move: Move): Action => ({
  type: "bet",
  payload: move
});

export const makeNewGame = (userIds: string[]): GameDataCore => {
  const game = newGame();

  const actions: Action[] = userIds.map(u => ({
    type: "add-player",
    payload: u
  }));
  actions.push({ type: "reset" });
  actions.push({ type: "deal" });
  return actions.reduce(gameReducer, game);
};

export const checkIntergrity = (gameData: GameDataCore) => {
  const total = gameData.users.reduce((acc, curr) => {
    return acc + curr.tokens;
  }, 0);
  return total;
};
