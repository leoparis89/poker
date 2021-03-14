import styled from "@emotion/styled";
import { Box, colors, Paper } from "@material-ui/core";
import React, { FunctionComponent } from "react";
import { UserGameData } from "../../back/game/game-engine/models";
import { UserSession } from "../../common/models";
import { PlayingCard } from "../cards/PlayingCard";
import { Chip } from "./Chip";

require("./ribbon.css");

const Wrapper = styled(Paper)((props: any) => ({
  minHeight: 150,
  ...(props.currentTurn && {
    boxShadow: `0 2px 10px 0 ${colors.green[500]}`,
  }),
  padding: 20,
  borderRadius: 10,
  overflow: "hidden",
  position: "relative",
}));

export const UserCard: FunctionComponent<UserDataUI> = ({
  profile,
  online,
  gameData,
  currentTurn,
  showCards,
  isDealer,
}) => {
  return (
    <>
      <Box height={100}>
        {gameData && gameData.bet !== null && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Chip chipSize={60} />
            <span style={{ fontSize: "1.8em" }}>{gameData.bet}</span>
          </div>
        )}
      </Box>
      <Wrapper
        data-testid={`user-card-${profile.id}`}
        role="listitem"
        currentTurn={currentTurn}
      >
        {isDealer && (
          <div className="corner-ribbon top-right sticky blue shadow">
            Dealer
          </div>
        )}
        <UserInfo profile={profile} online={online} />
        {gameData && (
          <Box display="flex" alignItems="center">
            <Chip chipSize={30} />
            {gameData.tokens}
          </Box>
        )}
      </Wrapper>
      {gameData?.hand && <Hand showCards={showCards} hand={gameData.hand} />}
    </>
  );
};

const UserInfo = ({ profile, online }) => {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <img
        style={{ borderRadius: "50%", width: 50, margin: 10 }}
        src={profile.photos?.[0].value}
      />
      <span style={{ margin: 10 }}>{profile.displayName}</span>
      <Online online={online}></Online>
    </div>
  );
};

const Hand = ({ hand, showCards }) => (
  <div
    className="hand hhand-compact"
    data-fan="spacing: 0.1; width: 80; radius: 80;"
  >
    <PlayingCard rankSuit={showCards ? hand[0] : "Blue_Back"} />
    <PlayingCard rankSuit={showCards ? hand[1] : "Blue_Back"} />
  </div>
);

export const Online = ({ online }) => (
  <span
    style={{
      height: 20,
      width: 20,
      backgroundColor: online ? "green" : "red",
      borderRadius: "50%",
      display: "inline-block",
      margin: 10,
      boxShadow: `0 2px 10px 0 ${online ? "green" : "red"}`,
    }}
  ></span>
);

export interface UserDataUI extends UserSession {
  gameData?: UserGameData;
  currentTurn?: boolean;
  isDealer: boolean;
  showCards: boolean;
}
