import { Move } from "../models";
import { makeNewGame, toAction, totalTokens } from "../_helpers.";
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
  let game = makeNewGame(["foo", "bar", "baz"]);
  const moves1: Move[] = [
    { userId: "bar" },
    { userId: "baz" },
    { userId: "foo", bet: 20 },
    { userId: "bar", bet: 10 }
  ];
  const actions = moves1.map(toAction);

  game = actions.reduce(gameReducer, game);
  expect(game).toEqual({
    deck: [
      "MockCard",
      "MockCard",
      "MockCard",
      "MockCard",
      "MockCard",
      "MockCard",
      "MockCard",
      "MockCard",
      "MockCard",
      "MockCard",
      "MockCard"
    ],
    flop: ["MockCard", "MockCard", "MockCard"],
    pot: 60,
    startTurn: 0,
    turn: 1,
    users: [
      { bet: null, hand: ["MockCard", "MockCard"], tokens: 980, userId: "foo" },
      { bet: null, hand: ["MockCard", "MockCard"], tokens: 980, userId: "bar" },
      { bet: null, hand: ["MockCard", "MockCard"], tokens: 980, userId: "baz" }
    ]
  });

  const moves2: Move[] = [
    { userId: "bar", bet: 0 },
    { userId: "baz", bet: 0 },
    { userId: "foo", bet: 0 }
  ];

  game = moves2.map(toAction).reduce(gameReducer, game);
  expect(game).toEqual({
    deck: [
      "MockCard",
      "MockCard",
      "MockCard",
      "MockCard",
      "MockCard",
      "MockCard",
      "MockCard",
      "MockCard",
      "MockCard",
      "MockCard"
    ],
    flop: ["MockCard", "MockCard", "MockCard", "MockCard"],
    pot: 60,
    startTurn: 0,
    turn: 1,
    users: [
      { bet: null, hand: ["MockCard", "MockCard"], tokens: 980, userId: "foo" },
      { bet: null, hand: ["MockCard", "MockCard"], tokens: 980, userId: "bar" },
      { bet: null, hand: ["MockCard", "MockCard"], tokens: 980, userId: "baz" }
    ]
  });

  const moves3: Move[] = [
    { userId: "bar", bet: 30 },
    { userId: "baz", bet: "fold" },
    { userId: "foo", bet: 30 }
  ];

  (getWinnerIdexes as jest.Mock).mockReturnValue([{ winnerIndex: 0 }]);
  game = moves3.map(toAction).reduce(gameReducer, game);
  expect(game).toEqual({
    deck: [
      "MockCard",
      "MockCard",
      "MockCard",
      "MockCard",
      "MockCard",
      "MockCard",
      "MockCard",
      "MockCard",
      "MockCard"
    ],
    flop: ["MockCard", "MockCard", "MockCard", "MockCard", "MockCard"],
    pot: 0,
    startTurn: 1,
    turn: 1,
    users: [
      {
        bet: null,
        hand: ["MockCard", "MockCard"],
        tokens: 1070,
        userId: "foo"
      },
      { bet: null, hand: ["MockCard", "MockCard"], tokens: 950, userId: "bar" },
      {
        bet: "fold",
        hand: ["MockCard", "MockCard"],
        tokens: 980,
        userId: "baz"
      }
    ]
  });

  expect(totalTokens(game)).toEqual(3000);

  expect(() => {
    gameReducer(game, {
      type: "bet",
      payload: { userId: "bar", bet: 4 }
    });
  }).toThrowError("Game is finished. No more turns allowed.");
});
