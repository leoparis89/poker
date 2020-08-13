import React from "react";
import { Button } from "react-bootstrap";

const googleLogin = require("./assets/googleSignIn/btn_google_signin_light_normal_web@2x.png");

export function Login() {
  return (
    <div style={{ textAlign: "center" }}>
      <h1>React Poker</h1>

      <a href="http://localhost:3000/auth/google">
        <img src={googleLogin} />
      </a>
    </div>
  );
}
