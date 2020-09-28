import styled from "@emotion/styled";
import React, { FunctionComponent } from "react";
import { Badge } from "react-bootstrap";
import { UserGameData } from "../../back/game/game-engine/models";
import { UserSession } from "../../common/models";
import { PlayingCard } from "../cards/PlayingCard";

const Wrapper = styled("div")((props: any) => ({
  // width: 350,
  // boxShadow: "0 2px 10px 0 rgb(185 185 185)",
  boxShadow: `0 2px 10px 0 ${props.currentTurn ? "green" : "rgb(185 185 185)"}`,
  padding: 0,
  borderRadius: 25,
  display: "flex",
  alignItems: "center",
  ...(props.currentTurn && { border: "solid 0.3em green" })
}));
export const UserCard: FunctionComponent<UserDataUI> = ({
  profile,
  online,
  gameData,
  currentTurn,
  showCards
}) => {
  return (
    <div role="listitem">
      {gameData && (
        <div style={{ display: "flex", margin: 10 }}>
          <Badge variant="primary">Tokens: {gameData.tokens}</Badge>
          {gameData.bet && <Badge variant="warning">Bet: {gameData.bet}</Badge>}
        </div>
      )}
      <Wrapper currentTurn={currentTurn}>
        <img
          style={{ borderRadius: "50%", width: 50, margin: 10 }}
          src={profile.photos?.[0].value}
        />
        <span style={{ margin: 10 }}>{profile.displayName}</span>
        <Online online={online}></Online>
        <br />
        {/* <Card style={{ width: "18rem" }}>
    <Card.Img variant="top" src={profile.photos?.[0].value} />
    <Card.Body>
    <Card.Title>{profile.displayName}</Card.Title>
    <Online online={online}></Online>
    </Card.Body>
    </Card> */}
      </Wrapper>
      {gameData?.hand && (
        <div
          style={{ display: "flex", margin: 10 }}
          data-fan="spacing: 0.1; width: 80; radius: 80;"
        >
          <PlayingCard rankSuit={showCards ? gameData.hand[0] : "Blue_Back"} />
          <PlayingCard rankSuit={showCards ? gameData.hand[1] : "Blue_Back"} />
        </div>
      )}
    </div>
  );
};

export const Online = ({ online }) => (
  <span
    style={{
      height: 20,
      width: 20,
      backgroundColor: online ? "green" : "red",
      borderRadius: "50%",
      display: "inline-block",
      margin: 10
    }}
  ></span>
);

export interface UserDataUI extends UserSession {
  gameData?: UserGameData;
  currentTurn?: boolean;
  showCards: boolean;
}
