import React from "react";
import { Button } from "react-bootstrap";

export function Login() {
  return (
    <div style={{ textAlign: "center" }}>
      <h1>React Poker</h1>
      <Button href="http://localhost:3000/auth/google">Login</Button>
    </div>
  );
}
