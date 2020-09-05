import { Profile } from "passport-google-oauth20";
import React, { useEffect, useState, useContext } from "react";
import { Alert, Col, Container, Row } from "react-bootstrap";
import { useRouteMatch } from "react-router-dom";
import { socketService } from "../socketService";
import { ChatWindow } from "./ChatWindow";
import { UserCard } from "./UserCard";
import { SessionContext } from "../context/SessionContext";

export function Game(props) {
  const [activeGame, setActiveGame] = useState<string>();
  const [users, setUsers] = useState<Profile[]>([]);
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
      socket.on("connected-users", (users: Profile[]) => {
        setUsers(users);
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
            {users.map(user => (
              <Col sm={4} key={user.id}>
                <UserCard user={user} key={user.id} />
              </Col>
            ))}
          </Row>
          <ChatWindow></ChatWindow>
        </div>
      )}
    </Container>
  );
}
