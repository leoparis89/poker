import React from "react";
import { PlayingCard } from "../cards/PlayingCard";
import { Paper, styled } from "@material-ui/core";

const StyledPaper = styled(Paper)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: 200,
  margin: theme.spacing(2),
  borderRadius: 25,
  ...(process.env.NODE_ENV !== "test" && {
    backgroundImage: `url(${require("./assets/table-background.jpg")})`,
  }),
}));

export const Flop = ({ flop }) => {
  return (
    <StyledPaper elevation={5}>
      {flop &&
        flop.map((rankSuit) => (
          <div style={{ margin: 10 }}>
            <PlayingCard rankSuit={rankSuit} />
          </div>
        ))}
    </StyledPaper>
  );
};
