import { Button, Typography } from "@material-ui/core";
import React from "react";

// const googleLogin = require("./assets/googleSignIn/btn_google_signin_light_normal_web@2x.png");

export function Login() {
  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get("gameId");
  const queryStr = gameId ? "?gameId=" + gameId : "";
  return (
    <div
      style={{
        textAlign: "center",
        // backgroundPosition: "cover",
        // backgroundRepeat: "no-repeat",
        // background:
        //   "linear-gradient(217deg, rgb(9, 6, 37), rgb(75, 46, 110), rgb(43, 118, 142))",
      }}
    >
      <Typography variant="h1">React Poker &#9824;&#65039;</Typography>

      <a
        style={{ marginTop: 30, display: "block", textDecoration: "none" }}
        href={require("../urls").googleAuth + queryStr}
      >
        <Button variant="contained" color="primary">
          Login with google
        </Button>
      </a>
    </div>
  );
}
