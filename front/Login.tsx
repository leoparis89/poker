import React from "react";

const googleLogin = require("./assets/googleSignIn/btn_google_signin_light_normal_web@2x.png");

// const url = require("./assets/login-image.jpg");
export function Login() {
  return (
    <div
      style={{
        textAlign: "center",
        // backgroundImage: `url("${url}")`,
        backgroundPosition: "cover",
        backgroundRepeat: "no-repeat",
        height: "100vh"
      }}
    >
      <h1 style={{ color: "white" }}>React Poker</h1>

      <a href={require("./urls").googleAuth}>
        <img src={googleLogin} />
      </a>
    </div>
  );
}
