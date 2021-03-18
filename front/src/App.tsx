import { styled } from "@material-ui/core";
import React from "react";
import { BrowserRouter as Router, Redirect, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthRoute } from "./AuthRoute";
import { Session } from "./context/SessionContext";
import { Footer } from "./Footer";
import { ConnectedGame } from "./game/Game";
import { Home } from "./home/Home";
import { Login } from "./Login";
import { DarkLight } from "./theme/DarkLight";
import { PokerTheme } from "./theme/PokerTheme";

export const App = function () {
  return (
    <FullHeightWrapper>
      <DarkLight>
        <PokerTheme>
          <Session>
            <Router>
              <Switch>
                <AuthRoute path={"/home"} component={Home} isPublic={false} />
                <AuthRoute
                  path={"/game/:id"}
                  component={ConnectedGame}
                  isPublic={false}
                />
                <AuthRoute path={"/login"} component={Login} isPublic={true} />
                <Redirect exact to="/home" />
              </Switch>
            </Router>
            <ToastContainer />
          </Session>
        </PokerTheme>
      </DarkLight>
      <Footer />
    </FullHeightWrapper>
  );
};

const FullHeightWrapper = styled("div")({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
});
