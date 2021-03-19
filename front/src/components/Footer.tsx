import { styled } from "@material-ui/core";
import React from "react";

import { settings } from "../../../back/src/settings";

const StyledFooter = styled("footer")(({ theme }) => ({
  textAlign: "center",
  marginTop: "auto",
  padding: theme.spacing(3),
}));

export const Footer = () => (
  <StyledFooter>
    React Poker &#9824;&#65039; version {settings.version}
  </StyledFooter>
);
