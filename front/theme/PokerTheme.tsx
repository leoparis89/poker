import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import React, { useContext } from "react";
import { ThemeContext } from "./DarkLight";

export const PokerTheme: React.FC = ({ children }) => {
  const { theme } = useContext(ThemeContext);

  const darkTheme = createMuiTheme({
    palette: {
      type: theme,
      // primary: { main: colors.blue },
      // secondary: { main: colors.darkGray },
    },
  });
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
