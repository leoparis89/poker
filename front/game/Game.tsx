import React, { useEffect, useState } from "react";
import { useRouteMatch } from "react-router-dom";
import { socketService } from "../socketService";
import { Profile } from "passport-google-oauth20";
import { UserCard } from "./UserCard";
import { Container, Row, Col } from "react-bootstrap";

export function Game(props) {
  const [activeGame, setSocket] = useState<string>();
  const [users, setUsers] = useState<Profile[]>([]);
  const gameId = useRouteMatch<{ id: string }>().params.id;

  useEffect(() => {
    if (!activeGame) {
      socketService.socket.emit("joinGame", gameId);
      socketService.socket.on("connected-users", (users: Profile[]) => {
        setUsers(users);
      });
    }
    return () => {};
  }, []);
  return (
    <Container>
      <Row>
        {users.map(user => (
          <Col sm={4}>
            <UserCard user={user} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}
