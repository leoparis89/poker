import { Paper, styled, Typography } from "@material-ui/core";
import React, { FunctionComponent } from "react";
import { WinnerInfoWithAmount } from "back/game/game-engine/solver";
import { UserSession } from "common/models";

interface WinnersProps {
  winners?: WinnerInfoWithAmount[];
  players: UserSession[];
}

export const Winners: FunctionComponent<WinnersProps> = ({
  winners,
  players,
}) => {
  return (
    <div>
      {winners?.map((info) => {
        const player = players[info.winnerIndex];
        return (
          <Typography variant="h4" component="div">
            {player.profile.displayName} wins {info.amount} with {info.descr}!
          </Typography>
        );
      })}
    </div>
  );
};
