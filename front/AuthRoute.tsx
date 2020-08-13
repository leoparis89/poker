import Cookies from "js-cookie";
import React from "react";
import { Redirect, Route } from "react-router-dom";
import { NavBar } from "./NavBar";

export function AuthRoute({ path, component: Comp, isPublic }) {
  const loggedIn = !!Cookies.get("loggedIn");

  if (isPublic) {
    return loggedIn ? (
      <Redirect to="/home"></Redirect>
    ) : (
      <Route path={path}>
        <Comp></Comp>
      </Route>
    );
  }

  return loggedIn ? (
    <Route path={path}>
      <NavBar />
      <Comp></Comp>
    </Route>
  ) : (
    <Redirect to="/login"></Redirect>
  );
}
