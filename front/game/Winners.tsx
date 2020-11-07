import styled from "@emotion/styled";
import React, { FunctionComponent } from "react";
import { WinnerInfoWithAmount } from "../../back/game/game-engine/solver";
import { UserSession } from "../../common/models";
import { Label } from "./Game";

interface WinnersProps {
  winners?: WinnerInfoWithAmount[];
  players: UserSession[];
}
const Wrapper = styled.div({});
styled;
export const Winners: FunctionComponent<WinnersProps> = ({
  winners,
  players
}) => {
  return (
    <Wrapper>
      {winners?.map(info => {
        const player = players[info.winnerIndex];
        return (
          <Label>
            {player.profile.displayName} wins {info.amount} with {info.descr}!
          </Label>
        );
      })}
    </Wrapper>
  );
};
