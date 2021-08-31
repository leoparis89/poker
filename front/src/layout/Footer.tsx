import { styled } from "@material-ui/core";
import React from "react";

import { version } from "../../../package.json";

const StyledFooter = styled("footer")(({ theme }) => ({
  textAlign: "center",
  marginTop: "auto",
  padding: theme.spacing(3),
}));

export const Footer = () => (
  <StyledFooter>React Poker &#9824;&#65039; version {version}</StyledFooter>
);
