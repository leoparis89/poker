import React, { useContext, useEffect, useState } from "react";
import { Alert, Button, Container } from "react-bootstrap";
import { Redirect, useRouteMatch } from "react-router-dom";
import { ChatMessage, GameStateUI } from "../../common/models";
import { SessionContext } from "../context/SessionContext";
import { socketService } from "../socketService";
import { ChatWindow } from "./ChatWindow";
import { WrapperdControls } from "./Controls";
import { Flop } from "./Flop";
import { Players } from "./Players";

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

    return () => {
      socket.removeAllListeners();
    };
  }, [user]);

  if (quit) {
    return <Redirect exact to="/home" />;
  }

  return (
    <Table>
      <Container>
        {error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          gameState && (
            <div>
              <Alert variant="success">Game ID: {gameState.gameData.id}</Alert>
              <h2>Pot: {gameState.gameData.pot}</h2>
              <Flop flop={gameState.gameData.flop} />
              <Players gameState={gameState} myId={user.id}></Players>
              <WrapperdControls
                gameData={gameState.gameData}
                myId={user.id}
                onDeal={handleDeal}
                onBet={handleBet}
              ></WrapperdControls>
              <ChatWindow messages={messages}></ChatWindow>
              <Button onClick={quitGame} variant="danger">
                Leave game
              </Button>
            </div>
          )
        )}
      </Container>
    </Table>
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

const handleBet = (amount: number | "fold") =>
  socketService.socket.emit("bet", amount);

const Table = props => {
  // const img = require("./assets/table-background.jpg");
  return (
    <div
    // style={{
    //   backgroundImage: `url("./assets/table-background.jpg");`
    // }}
    >
      {props.children}
    </div>
  );
};
