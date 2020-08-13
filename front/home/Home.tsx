import React, { useContext, useState, useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import { Redirect } from "react-router-dom";
import { gameService } from "../gameService";
import { logout, SessionContext } from "../Session";
import Join from "./Join";
import { socketService } from "../socketService";

export const Home = function () {
  const { user } = useContext(SessionContext);
  const [activeGameId, setActiveGameId] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (user) {
      socketService.init();
    }
    // return () => {};
  });

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const newGame = () =>
    gameService.new().then(result => {
      setActiveGameId(result.id);
    });

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Home</h1>
      <h2>Welcome {user?.displayName} !</h2>
      <Button onClick={newGame}>New Game</Button>
      <Button onClick={() => setShow(true)}>Join</Button>
      <Button onClick={logout}>Logout</Button>
      {activeGameId && <Redirect to={`/game/${activeGameId}`}></Redirect>}
      <Join show={show} handleClose={handleClose}></Join>
    </div>
  );
};
