import { Grid } from "@material-ui/core";
import React, { FunctionComponent } from "react";
// import { gameIsOver } from "back/src/game/game-engine/gameMethods";
import { gameIsOver } from "back/src/game/game-engine/gameMethods";
import { GameStateUI } from "common/models";
import { UserCard } from "./UserCard";

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
