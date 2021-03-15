import { NightsStay, WbSunny } from "@material-ui/icons";
import React, { useContext } from "react";
import { Theme, ThemeContext } from "./DarkLight";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <div onClick={toggleTheme} style={{ cursor: "pointer" }}>
      {theme === Theme.Dark ? <NightsStay /> : <WbSunny />}
    </div>
  );
};
