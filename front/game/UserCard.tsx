import React, { FunctionComponent } from "react";
import { Profile } from "passport-google-oauth20";
import { Card } from "react-bootstrap";

interface UserCardProps {
  user: Profile;
}

export const UserCard: FunctionComponent<UserCardProps> = ({ user }) => {
  return (
    <div>
      <Card style={{ width: "18rem" }}>
        <Card.Img variant="top" src={user.photos?.[0].value} />
        <Card.Body>
          <Card.Title>{user.displayName}</Card.Title>
          <Card.Text>some user</Card.Text>
        </Card.Body>
      </Card>
    </div>
  );
};
