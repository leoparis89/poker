import { Box, Button, Chip, Container, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from "react";
import { Redirect, useRouteMatch } from "react-router-dom";
import { gameStarted } from "../../../back/src/game/game-engine/gameMethods";
import { WinnerInfoWithAmount } from "../../../back/src/game/game-engine/solver";
import { ChatMessage, GameStateUI, UserSession } from "../../../common/models";
import { SessionContext } from "../context/SessionContext";
import { socketService } from "../socketService";
import { ChatWindow } from "./ChatWindow";
import { Chip as PokerChip } from "./Chip";
import { WrapperdControls } from "./Controls";
import { Flop } from "./Flop";
import { Players } from "./Players";
import { Winners } from "./Winners";

export function Game({ user, gameId }) {
  const [gameState, setGameState] = useState<GameStateUI | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [quit, setQuit] = useState<boolean>(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const { socket } = socketService;

    socket.emit("joinGame", gameId);
    socket.on("join-failure", (message) => {
      setError(message);
    });

    socket.on("chat-history", (messages: ChatMessage[]) => {
      setMessages(messages);
      socketService.socket.on("chat-message", (message: ChatMessage) => {
        setMessages((prevMessages) => [...prevMessages, message]);
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
    <Container>
      <Table>
        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          gameState && (
            <div>
              <Chip label={`Game ID: ${gameState.gameData.id}`} />
              <Info players={gameState.players} gameData={gameState.gameData} />
              <Flop flop={gameState.gameData.flop} />
              <Players gameState={gameState} myId={user.id}></Players>
              <WrapperdControls
                gameData={gameState.gameData}
                myId={user.id}
                onDeal={handleDeal}
                onBet={handleBet}
              ></WrapperdControls>
              <ChatWindow messages={messages}></ChatWindow>
              <Button variant="contained" onClick={quitGame} color="secondary">
                Leave game
              </Button>
            </div>
          )
        )}
      </Table>
    </Container>
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

export const InfoDisplay: FunctionComponent<InfoDisplayProps> = ({
  gameStarted,
  winners,
  pot,
  players,
}) => {
  if (!gameStarted) {
    return <Alert severity="info">Game not started yet...</Alert>;
  }

  return (
    <Box height={100}>
      {winners ? (
        <Winners players={players} winners={winners}></Winners>
      ) : (
        <Box display="flex" alignItems="center">
          <Typography variant="h4" component="h4">
            Pot: {pot}
          </Typography>
          <PokerChip chipSize={30} />
        </Box>
      )}
    </Box>
  );
};

export const ConnectedGame = (props) => {
  const { user, connected } = useContext(SessionContext);
  const gameId = useRouteMatch<{ id: string }>().params.id;

  if (!user) {
    return <div>No User</div>;
  }
  return <Game {...props} user={user} gameId={gameId} />;
};

const quitGame = () => socketService.socket.emit("quit-game-request");

const handleDeal = () => socketService.socket.emit("deal");

const handleBet = (amount: number | "fold") =>
  socketService.socket.emit("bet", amount);

const Table = (props) => {
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
