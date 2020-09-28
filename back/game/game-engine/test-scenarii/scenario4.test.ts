import { newDeck } from "../deck-service/deckService";
import { mockDeck } from "../../../_fixtures";
import { newGame } from "../actionHandlers";
import { Action, Move } from "../models";
import { gameReducer } from "../gameReducer.";
import { toAction } from "../_helpers.";
import { gameIsOver } from "../gameMethods";

jest.mock("../deck-service/deckService");

beforeAll(() => {
  (newDeck as jest.Mock).mockReturnValue([...mockDeck]);
});

test("complete scenario 4 (everyone folds post flop)", () => {
  let game = newGame();

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
    { type: "reset" },
    { type: "deal" }
  ] as Action[];

  game = addUsers.reduce(gameReducer, game);

  const moves: Move[] = [
    { userId: "foo" },
    { userId: "bar" },
    { userId: "foo", bet: 10 }
    // { userId: "foo" }
  ];
  game = moves.map(toAction).reduce(gameReducer, game);

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
      "MockCard",
      "MockCard",
      "MockCard"
    ],
    flop: ["MockCard", "MockCard", "MockCard"],
    pot: 40,
    startTurn: 0,
    turn: 1,
    users: [
      { bet: null, hand: ["MockCard", "MockCard"], tokens: 980, userId: "foo" },
      { bet: null, hand: ["MockCard", "MockCard"], tokens: 980, userId: "bar" }
    ]
  });

  const moves2: Move[] = [
    { userId: "bar", bet: "fold" }
    // { userId: "foo" }
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
      "MockCard",
      "MockCard",
      "MockCard",
      "MockCard"
    ],
    flop: ["MockCard", "MockCard", "MockCard"],
    pot: 0,
    startTurn: 0,
    turn: 0,
    users: [
      {
        bet: null,
        hand: ["MockCard", "MockCard"],
        tokens: 1020,
        userId: "foo"
      },
      {
        bet: "fold",
        hand: ["MockCard", "MockCard"],
        tokens: 980,
        userId: "bar"
      }
    ]
  });
  expect(gameIsOver(game)).toEqual(true);
});
