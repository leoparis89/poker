import { Box, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { WinnerInfoWithAmount } from "back/game/game-engine/solver";
import { UserSession } from "common/models";
import React from "react";
import { gameStarted } from "../../../back/src/game/game-engine/gameMethods";
import { PokerChip } from "./PokerChip";
import { Winners } from "./Winners";

export const Info = ({ gameData, players }) => (
  <InfoDisplay
    gameStarted={gameStarted(gameData)}
    winners={gameData.winners}
    pot={gameData.pot}
    players={players}
  />
);

export interface InfoDisplayProps {
  gameStarted: boolean;
  pot: number;
  winners: WinnerInfoWithAmount[];
  players: UserSession[];
}

export const InfoDisplay: React.FC<InfoDisplayProps> = ({
  gameStarted,
  winners,
  pot,
  players,
}) => {
  if (!gameStarted) {
    return <Alert severity="info">Game not started yet...</Alert>;
  }

  return (
    <Box>
      {winners ? (
        <Winners players={players} winners={winners}></Winners>
      ) : (
        <Box display="flex" alignItems="center">
          <Typography variant="h4" component="span">
            Pot: {pot}
          </Typography>
          <PokerChip chipSize={30} />
        </Box>
      )}
    </Box>
  );
};
