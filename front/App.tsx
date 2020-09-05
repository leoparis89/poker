import React from "react";
import { BrowserRouter as Router, Redirect, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthRoute } from "./AuthRoute";
import { Session } from "./context/SessionContext";
import { Footer } from "./Footer";
import { Game } from "./game/Game";
import { Home } from "./home/Home";
import { Login } from "./Login";

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
      <Footer></Footer>
    </Session>
  );
};
