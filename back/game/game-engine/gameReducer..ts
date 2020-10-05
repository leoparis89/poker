import { flow } from "lodash";
import { GameDataCore, Action } from "./models";
import {
  checkGameIsNotOver,
  checkLegalTurn,
  checkEnoughUsers,
  handleBet,
  handleTurn,
  handleFlop,
  handleAddPlayer,
  handleRemovePlayer,
  handleDeal,
  handleReset,
  handleGains
} from "./actionHandlers";

export const gameReducer = (gameData: GameDataCore, action: Action) => {
  switch (action.type) {
    case "bet":
      const { userId, bet } = action.payload;
      return flow(
        checkGameIsNotOver,
        checkLegalTurn(userId),
        checkEnoughUsers,
        handleBet(bet),
        handleTurn,
        handleFlop,
        handleGains
      )(gameData);
    case "add-player":
      return handleAddPlayer(gameData, action.payload);
    case "remove-player":
      return handleRemovePlayer(gameData, action.payload);
    case "deal":
      return flow(handleDeal, handleTurn)(gameData);
    case "reset":
      return handleReset(gameData);
    default:
      return gameData;
  }
};
