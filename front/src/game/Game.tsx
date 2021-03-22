import { Button, Chip, Container, styled } from "@material-ui/core";
import { flow } from "lodash";
import { Alert } from "@material-ui/lab";
import React, { useContext, useEffect } from "react";
import { Redirect, useParams } from "react-router-dom";
import { SessionContext } from "../context/SessionContext";
import { socketService } from "../socketService";
import { ChatWindow } from "./ChatWindow";
import { WrapperdControls } from "./Controls";
import { Flop } from "./Flop";
import { GameContext, GameContextType } from "./GameContext";
import { Info } from "./Info";
import { Players } from "./Players";

type GameProps = {
  userId: string;
} & Omit<GameContextType, "setGameId">;

export const Game: React.FC<GameProps> = ({
  userId,
  gameState,
  messages,
  error,
  quit,
}) => {
  if (quit) {
    return <Redirect exact to="/home" />;
  }

  return (
    <Container>
      <div>
        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          gameState && (
            <div>
              <Chip label={`Game ID: ${gameState.gameData.id}`} />
              <Info players={gameState.players} gameData={gameState.gameData} />
              <Flop flop={gameState.gameData.flop} />
              <Players gameState={gameState} myId={userId}></Players>
              <WrapperdControls
                gameData={gameState.gameData}
                myId={userId}
                onDeal={handleDeal}
                onBet={handleBet}
              ></WrapperdControls>
              <ChatWindow messages={messages}></ChatWindow>
              <BtnWrapper>
                <Button
                  variant="contained"
                  onClick={quitGame}
                  color="secondary"
                >
                  Leave game
                </Button>
              </BtnWrapper>
            </div>
          )
        )}
      </div>
    </Container>
  );
};

const BtnWrapper = styled("div")(({ theme }) => ({
  margin: theme.spacing(2),
  textAlign: "center",
}));

export const withGameIdParamHandler = (Component: React.FC) => () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { setGameId } = useContext(GameContext);
  useEffect(() => {
    if (gameId) {
      setGameId(gameId);
    }
  }, [gameId]);

  return <Component />;
};

export const withGameData = (Component: React.FC<any>) => (props) => {
  const { user } = useContext(SessionContext);
  const gameContextProps = useContext(GameContext);

  return (
    user && <Component {...props} userId={user.id} {...gameContextProps} />
  );
};

export const ConnectedGame = flow(withGameData, withGameIdParamHandler)(Game);

const quitGame = () => socketService.socket.emit("quit-game-request");

const handleDeal = () => socketService.socket.emit("deal");

const handleBet = (amount: number | "fold") =>
  socketService.socket.emit("bet", amount);
