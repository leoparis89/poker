import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import React from "react";

const darkTheme = createMuiTheme({
  palette: {
    // type: "dark",
    // primary: { main: colors.blue },
    // secondary: { main: colors.darkGray },
  },
});

export const PokerTheme: React.FC = ({ children }) => (
  <ThemeProvider theme={darkTheme}>
    <CssBaseline />
    {children}
  </ThemeProvider>
);
