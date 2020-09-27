import React, { FunctionComponent } from "react";
import { Row, Col } from "react-bootstrap";
import { UserCard } from "./UserCard";
import { GameStateUI } from "../../common/models";

export const Players: FunctionComponent<{ gameState: GameStateUI }> = ({
  gameState
}) => {
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
              key={profile.id}
            />
          </Col>
        );
      })}
    </Row>
  );
};
