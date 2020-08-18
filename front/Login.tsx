import React from "react";

const googleLogin = require("./assets/googleSignIn/btn_google_signin_light_normal_web@2x.png");

export function Login() {
  return (
    <div style={{ textAlign: "center" }}>
      <h1>React Poker</h1>

      <a href={require("./urls").googleAuth}>
        <img src={googleLogin} />
      </a>
    </div>
  );
}
