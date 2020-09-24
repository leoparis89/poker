import { RankSuit } from "../../../common/interfaces";

import { shuffle } from "lodash";

const suits = ["H", "S", "C", "D"]; // Hearts, Spades, Clubs, Diamonds
const AsAndHeads = ["J", "Q", "K", "A"];

export const createOrderedDeck = () => {
  const result: RankSuit[] = [];
  suits.forEach(s => {
    for (let i = 2; i < 11; i++) {
      result.push(i + s);
    }
    AsAndHeads.forEach(h => result.push(h + s));
  });
  return result;
};

export const newDeck = () => shuffle(createOrderedDeck());
