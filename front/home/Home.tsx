import React, { useContext, useEffect, useState } from "react";
// import { Button } from "react-bootstrap";
import Button from "@material-ui/core/Button";
import { Redirect } from "react-router-dom";
import { logout, SessionContext } from "../context/SessionContext";
import { gameService } from "../gameService";
import Join from "./Join";

export const Home = function () {
  const { user } = useContext(SessionContext);
  const [activeGameId, setActiveGameId] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    // if (user) {
    // }
    // return () => {};
  });

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const newGame = () =>
    gameService.new().then((result) => {
      setActiveGameId(result.id);
    });

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Home</h1>
      <h2>Welcome {user?.displayName} !</h2>
      <Button variant="contained" color="primary" onClick={newGame}>
        New Game
      </Button>
      {/* <Button onClick={() => setShow(true)}>Join</Button>
      <Button onClick={logout}>Logout</Button> */}
      {activeGameId && <Redirect to={`/game/${activeGameId}`}></Redirect>}
      <Join show={show} handleClose={handleClose}></Join>
    </div>
  );
};
