import React from "react";
import { ToastContainer, toast } from "react-toastify";
import { BrowserRouter as Router, Redirect, Switch } from "react-router-dom";
import { AuthRoute } from "./AuthRoute";
import { Home } from "./home/Home";
import { Login } from "./Login";
import { Session } from "./Session";
import { Game } from "./game/Game";

export const App = function () {
  return (
    <Session>
      <Router>
        <Switch>
          <AuthRoute path={"/home"} component={Home} isPublic={false} />
          <AuthRoute path={"/game/:id"} component={Game} isPublic={false} />
          <AuthRoute path={"/login"} component={Login} isPublic={true} />
          <Redirect exact to="/home" />
        </Switch>
      </Router>
      <ToastContainer />
    </Session>
  );
};
