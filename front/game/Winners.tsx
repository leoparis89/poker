import React, { FunctionComponent } from "react";
import { WinnerInfo } from "../../back/game/game-engine/solver";
import { UserSession } from "../../common/models";
import styled from "@emotion/styled";

interface WinnersProps {
  winners?: WinnerInfo[];
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
      {winners?.map(e => {
        const player = players[e.winnerIndex];
        return (
          <h2>
            Player {player.profile.displayName} wins with {e.descr}!
          </h2>
        );
      })}
    </Wrapper>
  );
};