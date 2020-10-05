import { newGame } from "../actionHandlers";
import { gameReducer } from "../gameReducer.";
import { Action } from "../models";
import { newDeck } from "../deck-service/deckService";
import { mockDeck } from "../../../_fixtures";

jest.mock("../deck-service/deckService");

beforeAll(() => {
  (newDeck as jest.Mock).mockReturnValue([...mockDeck]);
});

test.skip("complete scenario 3", () => {
  const game = newGame();
  expect(game).toEqual({
    deck: new Array(20).fill("MockCard"),
    flop: null,
    pot: 0,
    turn: null,
    startTurn: null,
    users: []
  });
  const addUsers = [
    { type: "add-player", payload: "foo" },
    { type: "add-player", payload: "bar" },
    { type: "add-player", payload: "baz" },
    { type: "add-player", payload: "kuk" },
    { type: "reset" }
  ] as Action[];
  const result1 = addUsers.reduce(gameReducer, game);
  expect(result1).toEqual({
    deck: new Array(20).fill("MockCard"),
    flop: null,
    pot: 0,
    startTurn: 0,
    turn: 0,
    users: [
      { bet: null, hand: null, tokens: 1000, userId: "foo" },
      { bet: null, hand: null, tokens: 1000, userId: "bar" },
      { bet: null, hand: null, tokens: 1000, userId: "baz" },
      { bet: null, hand: null, tokens: 1000, userId: "kuk" }
    ]
  });
  const result2 = gameReducer(result1, { type: "deal" });
  expect(result2).toEqual({
    deck: new Array(12).fill("MockCard"),
    flop: null,
    pot: 0,
    turn: 0,
    startTurn: 0,
    users: [
      {
        bet: null,
        hand: ["MockCard", "MockCard"],
        tokens: 1000,
        userId: "foo"
      },
      {
        bet: null,
        hand: ["MockCard", "MockCard"],
        tokens: 1000,
        userId: "bar"
      },
      {
        bet: null,
        hand: ["MockCard", "MockCard"],
        tokens: 1000,
        userId: "baz"
      },
      {
        bet: null,
        hand: ["MockCard", "MockCard"],
        tokens: 1000,
        userId: "kuk"
      }
    ]
  });
});
