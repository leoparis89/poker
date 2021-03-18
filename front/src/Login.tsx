import React from "react";

const googleLogin = require("./assets/googleSignIn/btn_google_signin_light_normal_web@2x.png");

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
      <h1>React Poker</h1>

      <a
        style={{ marginTop: 30, display: "block" }}
        href={require("./urls").googleAuth + queryStr}
      >
        <img src={googleLogin} />
      </a>
    </div>
  );
}
