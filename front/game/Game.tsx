import React, { useContext, useEffect, useState } from "react";
import { Alert, Col, Container, Row, Button } from "react-bootstrap";
import { useRouteMatch, Redirect } from "react-router-dom";
import { UserData } from "../../common/interfaces";
import { SessionContext } from "../context/SessionContext";
import { socketService } from "../socketService";
import { ChatWindow } from "./ChatWindow";
import { UserCard } from "./UserCard";

export function Game(props) {
  const [activeGame, setActiveGame] = useState<string>();
  const [userDatas, setUserDatas] = useState<UserData[]>([]);
  const [quit, setQuit] = useState<boolean>(false);
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
      socket.on("quit-game", () => {
        setQuit(true);
      });
    });
    return () => {};
  }, [user]);

  if (quit) {
    return <Redirect exact to="/home" />;
  }

  return (
    <Container>
      {error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <div>
          <Alert variant="success">{activeGame}</Alert>
          <Button onClick={quitGame} variant="danger">
            Leave game
          </Button>
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

const quitGame = () => socketService.socket.emit("quit-game-request");
