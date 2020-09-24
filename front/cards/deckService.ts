import { RankSuit } from "../../common/interfaces";

import { shuffle } from "lodash";

const suits = ["H", "S", "C", "D"]; // Hearts, Spades, Clubs, Diamonds
const heads = ["J", "V", "Q", "K"];

export const createOrderedDeck = () => {
  const result: RankSuit[] = [];
  suits.forEach(s => {
    for (let i = 1; i < 11; i++) {
      result.push(i + s);
    }
    heads.forEach(h => result.push(h + s));
  });
  return result;
};

export const newDeck = () => shuffle(createOrderedDeck());
