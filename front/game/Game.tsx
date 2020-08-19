import React, { useEffect, useState } from "react";
import { useRouteMatch } from "react-router-dom";
import { socketService } from "../socketService";
import { Profile } from "passport-google-oauth20";
import { UserCard } from "./UserCard";
import { Container, Row, Col } from "react-bootstrap";
import { ChatWindow } from "./ChatWindow";

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
  console.log(users);
  return (
    <Container>
      <Row>
        {users.map(user => (
          <Col sm={4} key={user.id}>
            <UserCard user={user} key={user.id} />
          </Col>
        ))}
      </Row>
      <div>
        <ChatWindow users={users}></ChatWindow>
      </div>
    </Container>
  );
}
