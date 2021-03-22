import { ChatMessage, GameStateUI } from "common/models";
import { socketService } from "../socketService";
import React, { useEffect, useState } from "react";
import { useParams, useRouteMatch } from "react-router-dom";

export type GameContextType = {
  gameState: GameStateUI | null;
  messages: ChatMessage[];
  setGameId: (id: string) => void;
  error?: string;
  quit?: boolean;
};

export const GameContext = React.createContext<GameContextType>({
  gameState: null,
  messages: [],
  setGameId: () => {},
});

export const GameContextProvider: React.FC = ({ children }) => {
  const [gameState, setGameState] = useState<GameStateUI | null>(null);
  const [gameId, setGameId] = useState<string>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string>();
  const [quit, setQuit] = useState<boolean>();

  useEffect(() => {
    if (!gameId) {
      return;
    }

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
  }, [gameId]);

  return (
    <GameContext.Provider
      value={{
        gameState,
        messages,
        error,
        quit,
        setGameId,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
