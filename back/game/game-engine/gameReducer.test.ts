import { mockDeck } from "../../_fixtures";
import {
  getLastBlind,
  handleBet,
  newGame,
  playsersAreEven
} from "./actionHandlers";
import { newDeck } from "./deck-service/deckService";
import { gameReducer } from "./gameReducer.";
import { Action, GameDataCore, Move, UserGameData } from "./models";
import { getWinnerIndos } from "./solver";
import { toAction, makeNewGame } from "./_helpers.";

jest.mock("./deck-service/deckService");

beforeAll(() => {
  (newDeck as jest.Mock).mockReturnValue([...mockDeck]);
});

test("newGame should return the right value", () => {
  expect(newGame()).toEqual({
    deck: new Array(20).fill("MockCard"),
    flop: null,
    pot: 0,
    turn: 0,
    startTurn: 0,
    users: []
  });
});

describe("makeNewGame", () => {
  it("should return the right value", () => {
    const expected = {
      deck: new Array(14).fill("MockCard"),
      flop: null,
      pot: 0,
      turn: 1,
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
        }
      ]
    };
    expect(makeNewGame(["foo", "bar", "baz"])).toEqual(expected);
  });
});

describe("getLastBlind", () => {
  it("should return the right value", () => {
    const users = ([
      {
        userId: "foo",
        bet: 40,
        tokens: 100
      },
      {
        userId: "bar",
        bet: "fold",
        tokens: 100
      },
      {
        userId: "baz",
        bet: null,
        tokens: 100
      },
      {
        userId: "kuk",
        bet: null,
        tokens: 100
      }
    ] as UserGameData[]) as any;
    expect(getLastBlind(users, 2)).toEqual(40);
    expect(getLastBlind(users, 3)).toEqual(null);

    users[1].bet = 80;
    expect(getLastBlind(users, 2)).toEqual(80);
  });

  it("should return the right value (case a user is all in)", () => {
    const users = [
      {
        userId: "foo",
        bet: 40,
        tokens: 60
      },
      {
        userId: "bar",
        bet: "fold",
        tokens: 100
      },
      {
        userId: "baz",
        bet: 30,
        tokens: 0
      },
      {
        userId: "kuk",
        bet: null,
        tokens: 100
      }
    ] as UserGameData[];
    expect(getLastBlind(users, 3)).toEqual(40);
  });

  it("should return the right value (edge case with cycle)", () => {
    const users = [
      {
        userId: "foo",
        bet: "fold",
        tokens: 100
      },
      {
        userId: "bar",
        bet: "fold",
        tokens: 100
      },
      {
        userId: "baz",
        bet: null,
        tokens: 100
      },
      {
        userId: "kuk",
        bet: 50,
        tokens: 100
      }
    ] as UserGameData[];
    expect(getLastBlind(users, 2)).toEqual(50);
  });
});

describe("playersAreEven", () => {
  it("should return the right value (case everyone played)", () => {
    const users = [
      {
        userId: "foo",
        bet: 30,
        tokens: 100
      },
      {
        userId: "bar",
        bet: 30,
        tokens: 100
      },
      {
        userId: "baz",
        bet: 30,
        tokens: 100
      },
      {
        userId: "kuk",
        bet: 30,
        tokens: 100
      }
    ] as UserGameData[];

    expect(playsersAreEven(users)).toEqual(true);
  });

  it("should return the right value (case player folded)", () => {
    const users = [
      {
        userId: "foo",
        bet: 30,
        tokens: 100
      },
      {
        userId: "bar",
        bet: 30,
        tokens: 100
      },
      {
        userId: "baz",
        bet: "fold",
        tokens: 100
      },
      {
        userId: "kuk",
        bet: 30,
        tokens: 100
      }
    ] as UserGameData[];

    expect(playsersAreEven(users)).toEqual(true);
  });

  it("should return the right value (case player didn't play)", () => {
    const users = [
      {
        userId: "foo",
        bet: 30,
        tokens: 100
      },
      {
        userId: "bar",
        bet: 30,
        tokens: 100
      },
      {
        userId: "baz",
        bet: null,
        tokens: 100
      },
      {
        userId: "kuk",
        bet: 30,
        tokens: 100
      }
    ] as UserGameData[];

    expect(playsersAreEven(users)).toEqual(false);
  });
});

describe("handleBet", () => {
  it("should apply flold to users", () => {
    const game = makeNewGame(["foo", "bar", "baz"]);
    const result = handleBet("fold")({ ...game, turn: 1 });
    expect(result.users).toEqual([
      {
        bet: null,
        hand: ["MockCard", "MockCard"],
        tokens: 1000,
        userId: "foo"
      },
      {
        bet: "fold",
        hand: ["MockCard", "MockCard"],
        tokens: 1000,
        userId: "bar"
      },
      {
        bet: null,
        hand: ["MockCard", "MockCard"],
        tokens: 1000,
        userId: "baz"
      }
    ]);
  });

  it("should apply small blind to users", () => {
    const game = makeNewGame(["foo", "bar", "baz"]);
    const result = handleBet()(game);
    expect(result.users).toEqual([
      {
        bet: null,
        hand: ["MockCard", "MockCard"],
        tokens: 1000,
        userId: "foo"
      },
      { bet: 10, hand: ["MockCard", "MockCard"], tokens: 990, userId: "bar" },
      {
        bet: null,
        hand: ["MockCard", "MockCard"],
        tokens: 1000,
        userId: "baz"
      }
    ]);
  });

  it("should apply big blind to users", () => {
    const game = makeNewGame(["foo", "bar", "baz"]) as any;

    game.users[1].bet = 10;
    game.turn = 2;
    const result = handleBet()(game);
    expect(result.users).toEqual([
      {
        bet: null,
        hand: ["MockCard", "MockCard"],
        tokens: 1000,
        userId: "foo"
      },
      {
        bet: 10,
        hand: ["MockCard", "MockCard"],
        tokens: 1000,
        userId: "bar"
      },
      { bet: 20, hand: ["MockCard", "MockCard"], tokens: 980, userId: "baz" }
    ]);
  });

  it("should apply normal bet to users", () => {
    const game = makeNewGame(["foo", "bar", "baz", "kuk"]) as any;

    game.users[1].bet = 10;
    game.users[2].bet = 20;
    game.turn = 3;
    const result = handleBet(40)(game);
    expect(result.users).toEqual([
      {
        bet: null,
        hand: ["MockCard", "MockCard"],
        tokens: 1000,
        userId: "foo"
      },
      {
        bet: 10,
        hand: ["MockCard", "MockCard"],
        tokens: 1000,
        userId: "bar"
      },
      {
        bet: 20,
        hand: ["MockCard", "MockCard"],
        tokens: 1000,
        userId: "baz"
      },
      { bet: 40, hand: ["MockCard", "MockCard"], tokens: 960, userId: "kuk" }
    ]);
  });

  it("should throw if normal bet is too low and user is not all in", () => {
    const game = makeNewGame(["foo", "bar", "baz", "kuk"]) as any;

    game.users[1].bet = 10;
    game.users[2].bet = 20;
    game.turn = 3;
    expect(() => handleBet(19)(game)).toThrowError(
      "Amount 19 is insufficient. Minimum should be 20."
    );
  });

  it("should apply normal bet if it is too low and user is all in", () => {
    const game = makeNewGame(["foo", "bar", "baz", "kuk"]) as any;

    game.users[1].bet = 10;
    game.users[2].bet = 20;
    game.users[3].tokens = 19;
    game.turn = 3;
    expect(handleBet(19)(game).users).toEqual([
      {
        bet: null,
        hand: ["MockCard", "MockCard"],
        tokens: 1000,
        userId: "foo"
      },
      {
        bet: 10,
        hand: ["MockCard", "MockCard"],
        tokens: 1000,
        userId: "bar"
      },
      {
        bet: 20,
        hand: ["MockCard", "MockCard"],
        tokens: 1000,
        userId: "baz"
      },
      { bet: 19, hand: ["MockCard", "MockCard"], tokens: 0, userId: "kuk" }
    ]);
  });
});

describe("gameReducer", () => {
  it("should throw if wrong user plays", () => {
    const game = makeNewGame(["foo", "bar", "baz", "kuk"]);
    const expected =
      'User "baz" of index 2 is not allowed to play on this turn.\n' +
      'Expecting "bar" of index 1 to play.';

    expect(() =>
      gameReducer(game, toAction({ bet: 3, userId: "baz" }))
    ).toThrowError(expected);
  });

  it("should throw if user plays and not enough users", () => {
    const game = makeNewGame(["foo"]);

    expect(() =>
      gameReducer(game, toAction({ bet: 3, userId: "foo" }))
    ).toThrowError("Not enough users in game to play.");
  });

  it("should increment turn", () => {
    const game = makeNewGame(["foo", "bar", "baz"]);
    const result = gameReducer(game, toAction({ userId: "bar" }));
    expect(result.turn).toEqual(2);
  });

  it("should increment turn and ignore folded users", () => {
    const game = makeNewGame(["foo", "bar", "baz", "kuk"]);

    const moves: Move[] = [
      { userId: "bar" },
      { userId: "baz", bet: "fold" },
      { userId: "kuk", bet: 20 },
      { userId: "foo", bet: 20 }
    ];

    const actions = moves.map(toAction);

    const result = actions.reduce(gameReducer, game);
    expect(result.turn).toEqual(1);
  });

  it("should flop", () => {
    const game = makeNewGame(["foo", "bar", "baz"]);

    const moves: Move[] = [
      { userId: "bar" },
      { userId: "baz" },
      { userId: "foo", bet: 20 },
      { userId: "bar", bet: 10 }
    ];

    const actions = moves.map(toAction);
    const result = actions.reduce(gameReducer, game);

    const expected = {
      flop: ["MockCard", "MockCard", "MockCard"],
      pot: 60,
      turn: 1,
      startTurn: 0,
      deck: new Array(11).fill("MockCard"),
      users: [
        {
          bet: null,
          hand: ["MockCard", "MockCard"],
          tokens: 980,
          userId: "foo"
        },
        {
          bet: null,
          hand: ["MockCard", "MockCard"],
          tokens: 980,
          userId: "bar"
        },
        {
          bet: null,
          hand: ["MockCard", "MockCard"],
          tokens: 980,
          userId: "baz"
        }
      ]
    };

    expect(result).toEqual(expected);
  });
});

//   test("complete scenario 2", () => {
//     const game = makeNewGame("foo", ["foo", "bar", "baz", "kuk", "boz"]);

//     (game.users as any)[3].tokens = 100;
//     const moves1 = [
//       { userId: "foo" },
//       { userId: "bar" },
//       { userId: "baz", bet: 500 },
//       { userId: "kuk", bet: 100 },
//       { userId: "boz", bet: 500 },
//       { userId: "foo", bet: 490 },
//       { userId: "bar", bet: 480 }
//     ];

//     const result1 = moves1.map(toAction).reduce(gameReducer, game);
//     expect(result1).toEqual({
//       flop: ["MockCard", "MockCard", "MockCard"],
//       pot: 2100,
//       turn: 2,
//       deck: newDeck,
//       users: [
//         {
//           bet: null,
//           hand: ["MockCard", "MockCard"],
//           tokens: 500,
//           userId: "foo"
//         },
//         {
//           bet: null,
//           hand: ["MockCard", "MockCard"],
//           tokens: 500,
//           userId: "bar"
//         },
//         {
//           bet: null,
//           hand: ["MockCard", "MockCard"],
//           tokens: 500,
//           userId: "baz"
//         },
//         {
//           bet: null,
//           hand: ["MockCard", "MockCard"],
//           tokens: 0,
//           userId: "kuk"
//         },
//         {
//           bet: null,
//           hand: ["MockCard", "MockCard"],
//           tokens: 500,
//           userId: "boz"
//         }
//       ]
//     });
//   });
// });

// describe("user reducers", () => {});
