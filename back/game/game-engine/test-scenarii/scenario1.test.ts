import { Move } from "../models";
import { makeNewGame, toAction } from "../_helpers.";
import { gameReducer } from "../gameReducer.";
import { getWinnerIdexes } from "../solver";
import { newDeck } from "../deck-service/deckService";
import { mockDeck } from "../../../_fixtures";

jest.mock("../deck-service/deckService");
jest.mock("../solver");

beforeAll(() => {
  (newDeck as jest.Mock).mockReturnValue([...mockDeck]);
});

test("complete scenario", () => {
  const game = makeNewGame("foo", ["foo", "bar", "baz", "kuk", "boz"]);
  const moves1: Move[] = [
    { userId: "foo" },
    { userId: "bar" },
    { userId: "baz", bet: 30 },
    { userId: "kuk", bet: "fold" },
    { userId: "boz", bet: 30 },
    { userId: "foo", bet: 20 },
    { userId: "bar", bet: 10 }
  ];
  const actions = moves1.map(toAction);

  const result1 = actions.reduce(gameReducer, game);
  expect(result1).toEqual({
    flop: ["MockCard", "MockCard", "MockCard"],
    pot: 120,
    turn: 2,
    startTurn: 0,
    deck: new Array(7).fill("MockCard"),
    users: [
      {
        bet: null,
        hand: ["MockCard", "MockCard"],
        tokens: 970,
        userId: "foo"
      },
      {
        bet: null,
        hand: ["MockCard", "MockCard"],
        tokens: 970,
        userId: "bar"
      },
      {
        bet: null,
        hand: ["MockCard", "MockCard"],
        tokens: 970,
        userId: "baz"
      },
      {
        bet: "fold",
        hand: ["MockCard", "MockCard"],
        tokens: 1000,
        userId: "kuk"
      },
      {
        bet: null,
        hand: ["MockCard", "MockCard"],
        tokens: 970,
        userId: "boz"
      }
    ]
  });

  const moves2: Move[] = [
    { userId: "baz", bet: 0 },
    { userId: "boz", bet: 0 },
    { userId: "foo", bet: "fold" },
    { userId: "bar", bet: 0 }
  ];

  const result2 = moves2.map(toAction).reduce(gameReducer, result1);
  expect(result2).toEqual({
    deck: [
      "MockCard",
      "MockCard",
      "MockCard",
      "MockCard",
      "MockCard",
      "MockCard"
    ],
    flop: ["MockCard", "MockCard", "MockCard", "MockCard"],
    pot: 120,
    turn: 2,
    startTurn: 0,
    users: [
      {
        bet: "fold",
        hand: ["MockCard", "MockCard"],
        tokens: 970,
        userId: "foo"
      },
      {
        bet: null,
        hand: ["MockCard", "MockCard"],
        tokens: 970,
        userId: "bar"
      },
      {
        bet: null,
        hand: ["MockCard", "MockCard"],
        tokens: 970,
        userId: "baz"
      },
      {
        bet: "fold",
        hand: ["MockCard", "MockCard"],
        tokens: 1000,
        userId: "kuk"
      },
      {
        bet: null,
        hand: ["MockCard", "MockCard"],
        tokens: 970,
        userId: "boz"
      }
    ]
  });

  const moves3: Move[] = [
    { userId: "baz", bet: 50 },
    { userId: "boz", bet: 60 },
    { userId: "bar", bet: 60 },
    { userId: "baz", bet: 10 }
  ];

  (getWinnerIdexes as jest.Mock).mockReturnValue([
    { winnerIndex: 1 },
    { winnerIndex: 4 }
  ]);
  const result3 = moves3.map(toAction).reduce(gameReducer, result2);
  expect(result3).toEqual({
    flop: ["MockCard", "MockCard", "MockCard", "MockCard", "MockCard"],
    pot: 0,
    turn: 4,
    startTurn: 0,
    deck: new Array(5).fill("MockCard"),
    users: [
      {
        bet: "fold",
        hand: ["MockCard", "MockCard"],
        tokens: 970,
        userId: "foo"
      },
      {
        bet: null,
        hand: ["MockCard", "MockCard"],
        tokens: 1060,
        userId: "bar"
      },
      {
        bet: null,
        hand: ["MockCard", "MockCard"],
        tokens: 910,
        userId: "baz"
      },
      {
        bet: "fold",
        hand: ["MockCard", "MockCard"],
        tokens: 1000,
        userId: "kuk"
      },
      {
        bet: null,
        hand: ["MockCard", "MockCard"],
        tokens: 1060,
        userId: "boz"
      }
    ]
  });

  /**
   * Check that the sum of all provided bets + initial small and big bets
   * add up to the final pot
   */
  // expect(
  //   [...moves1, ...moves2, ...moves3].reduce((acc, { bet: bet }) => {
  //     return acc + (typeof bet === "number" ? bet : 0);
  //   }, 0) + 30
  // ).toEqual(result3.pot);

  expect(() => {
    gameReducer(result3, {
      type: "bet",
      payload: { userId: "boz", bet: 4 }
    });
  }).toThrowError("Game is finished. No more turns allowed.");

  // const result4 = gameReducer(result3, { type: "reset" });
  // expect(result4).toEqual({
  //   deck: new Array(20).fill("MockCard"),
  //   flop: null,
  //   pot: 300,
  //   startTurn: 1,
  //   turn: 1,
  //   users: [
  //     { bet: null, hand: null, tokens: 970, userId: "foo" },
  //     { bet: null, hand: null, tokens: 910, userId: "bar" },
  //     { bet: null, hand: null, tokens: 910, userId: "baz" },
  //     { bet: null, hand: null, tokens: 1000, userId: "kuk" },
  //     { bet: null, hand: null, tokens: 910, userId: "boz" }
  //   ]
  // });
});
