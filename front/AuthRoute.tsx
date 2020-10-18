import Cookies from "js-cookie";
import React from "react";
import { Redirect, Route } from "react-router-dom";
import { NavBar } from "./NavBar";
import { Footer } from "./Footer";

export function AuthRoute({ path, component: Comp, isPublic }) {
  const loggedIn = !!Cookies.get("loggedIn");

  if (isPublic) {
    return loggedIn ? (
      <Redirect to="/home" />
    ) : (
      <Route path={path}>
        <Comp />
      </Route>
    );
  }

  const { pathname } = window.location;
  const regex = /^\/game\/(.{9})$/;
  const match = regex.exec(pathname);
  const gameId = match && match[1];
  const gameIdQuery = gameId ? "?gameId=" + gameId : "";
  return loggedIn ? (
    <Route path={path}>
      <NavBar />
      <Comp />
      <Footer dark />
    </Route>
  ) : (
    <Redirect to={"/login" + gameIdQuery}></Redirect>
  );
}
