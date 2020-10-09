import React from "react";
import { Footer } from "./Footer";

const googleLogin = require("./assets/googleSignIn/btn_google_signin_light_normal_web@2x.png");

export function Login() {
  return (
    <div
      style={{
        textAlign: "center",
        backgroundPosition: "cover",
        backgroundRepeat: "no-repeat",
        height: "100vh",
        background:
          "linear-gradient(217deg, rgb(9, 6, 37), rgb(75, 46, 110), rgb(43, 118, 142))"
      }}
    >
      <h1 style={{ color: "white" }}>React Poker</h1>

      <a
        style={{ marginTop: 30, display: "block" }}
        href={require("./urls").googleAuth}
      >
        <img src={googleLogin} />
      </a>
      <Footer />
    </div>
  );
}
