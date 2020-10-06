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

  actions.push({
    type: "deal",
    payload: userIds[0]
  });
  return actions.reduce(gameReducer, game);
};

export const totalTokens = (gameData: GameDataCore) => {
  const total = gameData.users.reduce((acc, curr) => {
    return acc + curr.tokens;
  }, 0);
  return total + gameData.pot;
};
