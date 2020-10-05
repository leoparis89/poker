import { newDeck } from "../deck-service/deckService";
import { mockDeck } from "../../../_fixtures";
import { newGame } from "../actionHandlers";
import { Action, Move } from "../models";
import { gameReducer } from "../gameReducer.";
import { toAction } from "../_helpers.";

jest.mock("../deck-service/deckService");

beforeAll(() => {
  (newDeck as jest.Mock).mockReturnValue([...mockDeck]);
});

test.skip("complete scenario 2 (everyone folds preflop)", () => {
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
    { type: "add-player", payload: "baz" },
    { type: "reset" }
  ] as Action[];

  game = addUsers.reduce(gameReducer, game);

  const moves: Move[] = [
    { userId: "foo" },
    { userId: "bar" },
    { userId: "baz", bet: "fold" },
    { userId: "foo", bet: "fold" }
  ];
  game = moves.map(toAction).reduce(gameReducer, game);

  expect(game).toEqual({
    deck: mockDeck,
    flop: null,
    pot: 0,
    startTurn: 0,
    turn: 1,
    users: [
      { bet: "fold", hand: null, tokens: 990, userId: "foo" },
      { bet: null, hand: null, tokens: 1010, userId: "bar" },
      { bet: "fold", hand: null, tokens: 1000, userId: "baz" }
    ]
  });

  expect(() =>
    gameReducer(game, { type: "bet", payload: { userId: "bar", bet: 30 } })
  ).toThrowError("Game is finished. No more turns allowed.");
});
