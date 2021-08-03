import { styled, Typography, useTheme } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import React, { useContext, useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import { SessionContext } from "../context/SessionProvider";
import { gameService } from "../service/gameService";
import Join from "./Join";

export const Home = function () {
  const { user } = useContext(SessionContext);
  const [activeGameId, setActiveGameId] = useState("");
  const [show, setShow] = useState(false);
  const theme = useTheme();

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

  if (activeGameId) {
    return <Redirect to={`/game/${activeGameId}`} />;
  }

  return (
    <div style={{ textAlign: "center" }}>
      <Typography
        variant="h2"
        component="div"
        style={{ margin: theme.spacing(2) }}
      >
        Welcome {user?.displayName} !
      </Typography>
      <Button variant="contained" color="primary" onClick={newGame}>
        New Game
      </Button>
      {/* <Button onClick={() => setShow(true)}>Join</Button>
      <Button onClick={logout}>Logout</Button> */}
      <Join show={show} handleClose={handleClose} />
    </div>
  );
};
