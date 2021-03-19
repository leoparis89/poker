import "react-toastify/dist/ReactToastify.css";
require("cardsJS/dist/cards.js");
require("cardsJS/dist/cards.css");

import { PokerTheme } from "../src/theme/PokerTheme";

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
};

export const decorators = [
  (Story) => (
    <PokerTheme>
      <Story />
    </PokerTheme>
  ),
];
