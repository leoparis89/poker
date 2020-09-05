import React, { useContext } from "react";
import { Navbar } from "react-bootstrap";
import { SessionContext, logout } from "./context/SessionContext";
import { Link } from "react-router-dom";

export function NavBar() {
  const { user, connected } = useContext(SessionContext);
  console.log(connected);
  return (
    <Navbar bg="dark" variant="dark">
      <Navbar.Brand href="#home">
        <img
          alt=""
          src="/logo.svg"
          width="30"
          height="30"
          className="d-inline-block align-top"
        />{" "}
        Poker
      </Navbar.Brand>
      <Navbar.Text>
        <Link to="/home">Home</Link>
      </Navbar.Text>
      <Navbar.Toggle />
      {user && (
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
            <a href="#login">{user?.displayName}</a>
          </Navbar.Text>
          <img
            width="30"
            height="30"
            style={{ borderRadius: "50%", margin: "0 20px" }}
            src={user.photos?.[0].value as any}
          />
          <Online online={connected} />
          <Navbar.Text onClick={logout} style={{ cursor: "pointer" }}>
            Logout
          </Navbar.Text>
        </Navbar.Collapse>
      )}
    </Navbar>
  );
}

const Online = ({ online }) => (
  <div style={{ color: online ? "green" : "red" }}>
    {online ? "Online" : "Offline"}
  </div>
);
