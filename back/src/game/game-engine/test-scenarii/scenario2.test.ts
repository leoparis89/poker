import { Move } from "../models";
import {
  makeNewGame,
  toAction,
  totalTokens,
  makeMockDeck
} from "../_test-helpers.";
import { gameReducer } from "../gameReducer.";
import { getWinnerIndos, WinnerInfo } from "../solver";
import { newDeck } from "../deck-service/deckService";
import { mockDeck } from "../../../_fixtures";
import { gameIsOver } from "../gameMethods";

jest.mock("../deck-service/deckService");
jest.mock("../solver");

beforeAll(() => {
  (newDeck as jest.Mock).mockReturnValue([...mockDeck]);
});

test("complete scenario 2 (edge case where small blind user folds)", () => {
  let game = makeNewGame(["foo", "bar", "baz"]);
  const moves1: Move[] = [
    { userId: "bar" },
    { userId: "baz" },
    { userId: "foo", bet: 20 },
    { userId: "bar", bet: "fold" }
  ];
  const actions = moves1.map(toAction);

  game = actions.reduce(gameReducer, game);
  expect(game).toEqual({
    deck: makeMockDeck(11),
    flop: ["MockCard", "MockCard", "MockCard"],
    pot: 50,
    startTurn: 0,
    turn: 2,
    users: [
      { bet: null, hand: ["MockCard", "MockCard"], tokens: 980, userId: "foo" },
      {
        bet: "fold",
        hand: ["MockCard", "MockCard"],
        tokens: 990,
        userId: "bar"
      },
      { bet: null, hand: ["MockCard", "MockCard"], tokens: 980, userId: "baz" }
    ]
  });

  const moves2: Move[] = [
    { userId: "baz", bet: 0 },
    { userId: "foo", bet: 0 }
  ];

  game = moves2.map(toAction).reduce(gameReducer, game);
  expect(game).toEqual({
    deck: makeMockDeck(10),
    flop: ["MockCard", "MockCard", "MockCard", "MockCard"],
    pot: 50,
    startTurn: 0,
    turn: 2,
    users: [
      { bet: null, hand: ["MockCard", "MockCard"], tokens: 980, userId: "foo" },
      {
        bet: "fold",
        hand: ["MockCard", "MockCard"],
        tokens: 990,
        userId: "bar"
      },
      { bet: null, hand: ["MockCard", "MockCard"], tokens: 980, userId: "baz" }
    ]
  });

  const moves3: Move[] = [
    { userId: "baz", bet: 30 },
    { userId: "foo", bet: 30 }
  ];

  (getWinnerIndos as jest.Mock).mockReturnValue([
    { winnerIndex: 0, descr: "Mock flush" }
  ] as WinnerInfo[]);
  game = moves3.map(toAction).reduce(gameReducer, game);
  expect(game).toEqual({
    deck: makeMockDeck(9),
    flop: ["MockCard", "MockCard", "MockCard", "MockCard", "MockCard"],
    pot: 0,
    startTurn: 1,
    turn: 1,
    winners: [{ winnerIndex: 0, descr: "Mock flush", amount: 110 }],
    users: [
      {
        bet: null,
        hand: ["MockCard", "MockCard"],
        tokens: 1060,
        userId: "foo"
      },
      {
        bet: "fold",
        hand: ["MockCard", "MockCard"],
        tokens: 990,
        userId: "bar"
      },
      { bet: null, hand: ["MockCard", "MockCard"], tokens: 950, userId: "baz" }
    ]
  });

  expect(totalTokens(game)).toEqual(3000);
  expect(gameIsOver(game)).toEqual(true);
});
