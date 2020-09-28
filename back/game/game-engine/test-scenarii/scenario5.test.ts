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

test(" TODO complete scenario 5 (cycle turns)", () => {
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
    { type: "reset" }
  ] as Action[];

  game = addUsers.reduce(gameReducer, game);

  const moves: Move[] = [
    { userId: "foo" },
    { userId: "bar" },
    { userId: "foo", bet: 10 },
    { userId: "bar", bet: "fold" }
    // { userId: "foo" }
  ];
  game = moves.map(toAction).reduce(gameReducer, game);

  const moves2: Move[] = [
    { userId: "bar", bet: "fold" }
    // { userId: "foo" }
  ];
});
