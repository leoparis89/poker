import React, { FunctionComponent } from "react";
require("cardsJS/dist/cards.js");
require("cardsJS/dist/cards.css");

export interface PlayingCardProps {
  suit;
  rank;
}
export const PlayingCard: FunctionComponent<PlayingCardProps> = ({
  rank,
  suit
}) => {
  return (
    <img className="card" src={require(`cardsJS/cards/${rank}${suit}.svg`)} />
  );
};
