import React from "react";
import { PlayingCard } from "../cards/PlayingCard";
import styled from "@emotion/styled";

const Wrapper = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: 200,
  // border: "3px solid lightgreen",
  boxShadow: `0 2px 10px 0 rgb(185 185 185)`,
  borderRadius: 25,
  margin: "30px 0",
  backgroundImage: `url("${require("./assets/table-background.jpg")}")`
});

export const Flop = ({ flop }) => {
  return (
    <Wrapper>
      {flop &&
        flop.map(rankSuit => (
          <div style={{ margin: 10 }}>
            <PlayingCard rankSuit={rankSuit} />
          </div>
        ))}
    </Wrapper>
  );
};
