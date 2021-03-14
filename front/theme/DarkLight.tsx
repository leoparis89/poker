import React, { useState } from "react";

export enum Theme {
  Dark = "dark",
  Light = "light",
}

export const ThemeContext = React.createContext({
  theme: Theme.Light,
  toggleTheme: () => {},
});

export const DarkLight: React.FC = (props) => {
  const [theme, setTheme] = useState<Theme>(Theme.Light);

  const toggleTheme = () => {
    setTheme((prevTheme) =>
      prevTheme === Theme.Dark ? Theme.Light : Theme.Dark
    );
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {props.children}
    </ThemeContext.Provider>
  );
};
