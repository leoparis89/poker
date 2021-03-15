import React, { useState } from "react";

interface IGameContext {
  gameId: null | string;
  setGameId: any;
}
const initalContext: IGameContext = {
  gameId: null,
  setGameId: () => {}
};

export const GameContext = React.createContext(initalContext);

export function Game(props) {
  const [gameId, setGameId] = useState(null);
  return (
    <GameContext.Provider value={{ gameId, setGameId }}>
      {props.children}
    </GameContext.Provider>
  );
}
