import React, { useEffect, useState } from "react";
import { useRouteMatch } from "react-router-dom";
import { socketService } from "../socketService";

export function Game(props) {
  const [activeGame, setSocket] = useState<string>();
  const gameId = useRouteMatch<{ id: string }>().params.id;

  useEffect(() => {
    if (!activeGame) {
      socketService.socket.emit("joinGame", gameId);
    }
    return () => {};
  }, []);
  return <div>hello</div>;
}
