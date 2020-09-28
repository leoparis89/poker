import { Move, Action, GameDataCore } from "./models";
import { newGame } from "./actionHandlers";
import { gameReducer } from "./gameReducer.";

export const toAction = (move: Move): Action => ({
  type: "bet",
  payload: move
});

export const makeNewGame = (
  creatorId: string,
  userIds: string[]
): GameDataCore => {
  const creatorIndex = userIds.indexOf(creatorId);

  const game = newGame();
  if (creatorIndex === -1) {
    throw "Creator is not present in list.";
  }

  const actions: Action[] = userIds.map(u => ({
    type: "add-player",
    payload: u
  }));
  const result1 = actions.reduce(gameReducer, game);
  const result2 = gameReducer(result1, { type: "deal" });
  return { ...result2, turn: creatorIndex, startTurn: creatorIndex };
};
