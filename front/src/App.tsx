import { styled } from "@material-ui/core";
import React from "react";
import { BrowserRouter as Router, Redirect, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthRoute } from "./AuthRoute";
import { SessionProvider } from "./context/SessionProvider";
import { Footer } from "./layout/Footer";
import { Game } from "./game";
import { Home } from "./home";
import { Login } from "./login";
import { DarkLight } from "./theme/DarkLight";
import { PokerTheme } from "./theme/PokerTheme";
import { GameStateProvider } from "./game/GameStateProvider";

export const App = function () {
  return (
    <FullHeightWrapper>
      <DarkLight>
        <PokerTheme>
          <Router>
            <GameStateProvider>
              <Switch>
                <AuthRoute path={"/home"} component={Home} isPublic={false} />
                <AuthRoute
                  path={"/game/:gameId"}
                  component={Game}
                  isPublic={false}
                />
                <AuthRoute path={"/login"} component={Login} isPublic={true} />
                <Redirect exact to="/home" />
              </Switch>
            </GameStateProvider>
          </Router>
          <ToastContainer />
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
