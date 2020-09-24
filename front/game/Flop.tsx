import React from "react";
import { PlayingCard } from "../cards/PlayingCard";

export const Flop = ({ flop }) => {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      {flop &&
        flop.map(rankSuit => (
          <div style={{ margin: 10 }}>
            <PlayingCard rankSuit={rankSuit} />
          </div>
        ))}
    </div>
  );
};
