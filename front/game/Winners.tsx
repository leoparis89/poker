import styled from "@emotion/styled";
import React, { FunctionComponent } from "react";
import { WinnerInfoWithAmount } from "../../back/game/game-engine/solver";
import { UserSession } from "../../common/models";

interface WinnersProps {
  winners?: WinnerInfoWithAmount[];
  players: UserSession[];
}
const Wrapper = styled.div({});
styled;
export const Winners: FunctionComponent<WinnersProps> = ({
  winners,
  players,
}) => {
  return (
    <Wrapper>
      {winners?.map((info) => {
        const player = players[info.winnerIndex];
        return (
          <div>
            {player.profile.displayName} wins {info.amount} with {info.descr}!
          </div>
        );
      })}
    </Wrapper>
  );
};
