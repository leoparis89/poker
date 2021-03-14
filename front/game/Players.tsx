import React, { FunctionComponent } from "react";
import { Row, Col } from "react-bootstrap";
import { UserCard } from "./UserCard";
import { GameStateUI } from "../../common/models";
import { gameIsOver } from "../../back/game/game-engine/gameMethods";
import { Grid } from "@material-ui/core";

export const Players: FunctionComponent<{
  gameState: GameStateUI;
  myId: string;
}> = ({ gameState, myId }) => {
  return (
    <Grid container spacing={3}>
      {gameState.players.map(({ profile, online }) => {
        const userIndex = gameState.gameData.users.findIndex(
          (u) => u.userId === profile.id
        );
        const isCurrent = gameState.gameData.turn === userIndex;
        const isDealer = userIndex === gameState.gameData.startTurn;

        return (
          <Grid item xs={3} key={profile.id}>
            <UserCard
              isDealer={isDealer}
              profile={profile}
              online={online}
              currentTurn={isCurrent}
              gameData={gameState.gameData.users.find(
                (u) => u.userId === profile.id
              )}
              showCards={gameIsOver(gameState.gameData) || myId === profile.id} // to handle in back end of obviously
              key={profile.id}
            />
          </Grid>
        );
      })}
    </Grid>
  );
};
