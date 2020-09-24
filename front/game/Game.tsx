import React, { useContext, useEffect, useState } from "react";
import { Alert, Button, Col, Container, Row } from "react-bootstrap";
import { Redirect, useRouteMatch } from "react-router-dom";
import { ChatMessage, GameStateUI } from "../../common/interfaces";
import { SessionContext } from "../context/SessionContext";
import { socketService } from "../socketService";
import { ChatWindow } from "./ChatWindow";
import { Controls } from "./Controls";
import { UserCard } from "./UserCard";

export function Game({ user, gameId }) {
  const [gameState, setGameState] = useState<GameStateUI | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [quit, setQuit] = useState<boolean>(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const { socket } = socketService;

    socket.emit("joinGame", gameId);
    socket.on("join-failure", message => {
      setError(message);
    });

    socket.on("chat-history", (messages: ChatMessage[]) => {
      setMessages(messages);
      socketService.socket.on("chat-message", (message: ChatMessage) => {
        setMessages(prevMessages => [...prevMessages, message]);
      });
    });

    socket.on("game-data", (gameData: GameStateUI) => {
      setGameState(gameData);
    });

    socket.on("quit-game", () => {
      setQuit(true);
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
        gameState && (
          <div>
            <Alert variant="success">Game ID: {gameState.gameData.id}</Alert>
            <h2>Pot: {gameState.gameData.pot}</h2>
            <Row>
              {gameState.players.map(({ profile, online }) => (
                <Col sm={3} key={profile.id}>
                  <UserCard
                    profile={profile}
                    online={online}
                    gameData={gameState.gameData.users.find(
                      u => u.userId === profile.id
                    )}
                    key={profile.id}
                  />
                </Col>
              ))}
            </Row>
            <Controls
              gameData={gameState.gameData}
              myId={user.id}
              onDeal={handleDeal}
              onBet={handleBet}
            ></Controls>
            <ChatWindow messages={messages}></ChatWindow>
            <Button onClick={quitGame} variant="danger">
              Leave game
            </Button>
          </div>
        )
      )}
    </Container>
  );
}

export const ConnectedGame = props => {
  const { user, connected } = useContext(SessionContext);
  if (!user) {
    return <div>No User</div>;
  }
  const gameId = useRouteMatch<{ id: string }>().params.id;
  return <Game {...props} user={user} gameId={gameId} />;
};

const quitGame = () => socketService.socket.emit("quit-game-request");

const handleDeal = () => socketService.socket.emit("deal");

const handleBet = (amount: number) => socketService.socket.emit("bet", amount);
