import React, { FunctionComponent } from "react";
import { RankSuit } from "../../common/models";
require("cardsJS/dist/cards.js");
require("cardsJS/dist/cards.css");

export interface PlayingCardProps {
  rankSuit: RankSuit;
}
export const PlayingCard: FunctionComponent<PlayingCardProps> = ({
  rankSuit
}) => {
  return (
    <img className="card" src={require(`cardsJS/cards/${rankSuit}.svg`)} />
  );
};
