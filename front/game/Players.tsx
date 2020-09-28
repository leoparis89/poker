import React, { FunctionComponent } from "react";
import { Row, Col } from "react-bootstrap";
import { UserCard } from "./UserCard";
import { GameStateUI } from "../../common/models";
import { gameIsOver } from "../../back/game/game-engine/gameMethods";

export const Players: FunctionComponent<{
  gameState: GameStateUI;
  myId: string;
}> = ({ gameState, myId }) => {
  return (
    <Row>
      {gameState.players.map(({ profile, online }) => {
        const isCurrent =
          gameState.gameData.turn ===
          gameState.gameData.users.findIndex(u => u.userId === profile.id);
        return (
          <Col sm={3} key={profile.id}>
            <UserCard
              profile={profile}
              online={online}
              currentTurn={isCurrent}
              gameData={gameState.gameData.users.find(
                u => u.userId === profile.id
              )}
              showCards={gameIsOver(gameState.gameData) || myId === profile.id} // to handle in back end of obviously
              key={profile.id}
            />
          </Col>
        );
      })}
    </Row>
  );
};
