import { Profile } from "passport-google-oauth20";
import React, { useEffect, useState, useContext } from "react";
import { Alert, Col, Container, Row } from "react-bootstrap";
import { useRouteMatch } from "react-router-dom";
import { socketService } from "../socketService";
import { ChatWindow } from "./ChatWindow";
import { UserCard } from "./UserCard";
import { SessionContext } from "../context/SessionContext";
import { UserData } from "../../common/interfaces";

export function Game(props) {
  const [activeGame, setActiveGame] = useState<string>();
  const [userDatas, setUserDatas] = useState<UserData[]>([]);
  const [error, setError] = useState<string>();
  const { user, connected } = useContext(SessionContext);
  const gameId = useRouteMatch<{ id: string }>().params.id;

  useEffect(() => {
    if (!user) {
      return;
    }

    const { socket } = socketService;

    socket.emit("joinGame", gameId);
    socket.on("join-failure", message => {
      setError(message);
    });

    socket.on("join-success", gameId => {
      setActiveGame(gameId);
      socket.on("connected-users", (users: UserData[]) => {
        setUserDatas(users);
      });
    });
    return () => {};
  }, [user]);

  return (
    <Container>
      {error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <div>
          <Alert variant="success">{activeGame}</Alert>
          <Row>
            {userDatas.map(({ profile, gameData }) => (
              <Col sm={4} key={profile.id}>
                <UserCard
                  profile={profile}
                  gameData={gameData}
                  key={profile.id}
                />
              </Col>
            ))}
          </Row>
          <ChatWindow></ChatWindow>
        </div>
      )}
    </Container>
  );
}
