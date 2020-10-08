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

test("complete scenario 4 (all in)", () => {
  let game = makeNewGame(["foo", "bar", "baz"]);
  (game.users[0].tokens as any) = 50;
  expect(totalTokens(game)).toEqual(2050);
  const moves1: Move[] = [
    { userId: "bar" },
    { userId: "baz" },
    { userId: "foo", bet: 50 },
    { userId: "bar", bet: 40 },
    { userId: "baz", bet: 30 }
  ];
  const actions = moves1.map(toAction);

  game = actions.reduce(gameReducer, game);
  expect(game.flop?.length).toEqual(3);

  const moves2: Move[] = [
    { userId: "bar", bet: 100 },
    { userId: "baz", bet: 100 },
    { userId: "foo", bet: 0 }
  ];
  game = moves2.map(toAction).reduce(gameReducer, game);
  expect(game.flop?.length).toEqual(4);

  const moves3: Move[] = [
    { userId: "bar", bet: 0 },
    { userId: "baz", bet: 0 },
    { userId: "foo", bet: 0 }
  ];

  (getWinnerIndos as jest.Mock).mockReturnValue([
    { winnerIndex: 0, descr: "Mock flush" }
  ] as WinnerInfo[]);
  game = moves3.map(toAction).reduce(gameReducer, game);

  expect(totalTokens(game)).toEqual(2050);
  expect(gameIsOver(game)).toEqual(true);
});
