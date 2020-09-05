import React, { FunctionComponent } from "react";
import { Profile } from "passport-google-oauth20";
import { Card } from "react-bootstrap";
import { UserData } from "../../common/interfaces";

export const UserCard: FunctionComponent<UserData> = ({
  profile,
  gameData
}) => {
  return (
    <div>
      <Card style={{ width: "18rem" }}>
        <Card.Img variant="top" src={profile.photos?.[0].value} />
        <Card.Body>
          <Card.Title>{profile.displayName}</Card.Title>
          <Card.Text>score: {gameData.score} user</Card.Text>
          <Online online={gameData.online}></Online>
        </Card.Body>
      </Card>
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
      display: "inline-block"
    }}
  ></span>
);
