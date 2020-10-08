import { mockDeck } from "../../../_fixtures";
import { newDeck } from "../deck-service/deckService";
import { gameReducer } from "../gameReducer.";
import { Move } from "../models";
import { makeNewGame, toAction, makeMockDeck } from "../_test-helpers.";

jest.mock("../deck-service/deckService");
jest.mock("../solver");

beforeAll(() => {
  (newDeck as jest.Mock).mockReturnValue([...mockDeck]);
});

test("complete scenario 3 (everybody folds preflop)", () => {
  let game = makeNewGame(["foo", "bar", "baz"]);
  const moves1: Move[] = [
    { userId: "bar" },
    { userId: "baz" },
    { userId: "foo", bet: "fold" },
    { userId: "bar", bet: "fold" }
  ];
  const actions = moves1.map(toAction);

  game = actions.reduce(gameReducer, game);
  expect(game).toEqual({
    deck: makeMockDeck(14),
    flop: null,
    pot: 0,
    startTurn: 1,
    turn: 1,
    users: [
      {
        bet: "fold",
        hand: ["MockCard", "MockCard"],
        tokens: 1000,
        userId: "foo"
      },
      {
        bet: "fold",
        hand: ["MockCard", "MockCard"],
        tokens: 990,
        userId: "bar"
      },
      { bet: null, hand: ["MockCard", "MockCard"], tokens: 1010, userId: "baz" }
    ],
    winners: [{ descr: "Everyone folded", winnerIndex: 2 }]
  });
});
