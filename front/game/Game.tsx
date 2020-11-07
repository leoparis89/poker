import React, {
  useContext,
  useEffect,
  useState,
  FunctionComponent
} from "react";
import { Alert, Button, Container } from "react-bootstrap";
import { Redirect, useRouteMatch } from "react-router-dom";
import { ChatMessage, GameStateUI, UserSession } from "../../common/models";
import { SessionContext } from "../context/SessionContext";
import { socketService } from "../socketService";
import { ChatWindow } from "./ChatWindow";
import { WrapperdControls } from "./Controls";
import { Flop } from "./Flop";
import { Players } from "./Players";
import { Winners } from "./Winners";
import { gameStarted } from "../../back/game/game-engine/gameMethods";
import {
  WinnerInfo,
  WinnerInfoWithAmount
} from "../../back/game/game-engine/solver";
import styled from "@emotion/styled";
import { Chip } from "./Chip";

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
              <Info
                players={gameState.players}
                gameData={gameState.gameData}
              ></Info>
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

const Info = ({ gameData, players }) => {
  return (
    <InfoDisplay
      gameStarted={gameStarted(gameData)}
      winners={gameData.winners}
      pot={gameData.pot}
      players={players}
    />
  );
};

export interface InfoDisplayProps {
  gameStarted: boolean;
  pot: number;
  winners: WinnerInfoWithAmount[];
  players: UserSession[];
}

export const Label = styled.div({ fontSize: "1.8em" });

export const InfoDisplay: FunctionComponent<InfoDisplayProps> = ({
  gameStarted,
  winners,
  pot,
  players
}) => {
  if (!gameStarted) {
    return (
      <div style={{ height: 100 }}>
        <Label>Game not started yet...</Label>
      </div>
    );
  }

  return (
    <div style={{ height: 100 }}>
      {winners ? (
        <Winners players={players} winners={winners}></Winners>
      ) : (
        <Label style={{ display: "flex", alignItems: "center" }}>
          Pot: {pot}
          <Chip chipSize={30} />
        </Label>
      )}
    </div>
  );
};

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
