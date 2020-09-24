import {
  getLastBlind,
  handleBet,
  makeNewGame,
  playsersAreEven,
  newGame
} from "./actionHandlers";
import { gameReducer } from "./gameReducer.";
import { UserGameData, Move, Action } from "./models";
import { newDeck } from "./deckService";
import { mockDeck } from "../../_fixtures";

jest.mock("./deckService");

beforeAll(() => {
  (newDeck as jest.Mock).mockReturnValue([...mockDeck]);
});

const toAction = (move: Move): Action => ({ type: "bet", payload: move });

test("nexGame should return the right value", () => {
  expect(newGame()).toEqual({
    deck: new Array(20).fill("MockCard"),
    flop: null,
    pot: 0,
    turn: null,
    startTurn: null,
    users: []
  });
});

test("complete scenario 3", () => {
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
    { type: "add-player", payload: "kuk" }
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

describe("makeNewGame", () => {
  it("should return the right value", () => {
    const expected = {
      deck: new Array(14).fill("MockCard"),
      flop: null,
      pot: 0,
      turn: 1,
      startTurn: 1,
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
    expect(makeNewGame("bar", ["foo", "bar", "baz"])).toEqual(expected);
  });

  it("should throw if game creator is not present in list", () => {
    expect(() => makeNewGame("kuk", ["foo", "bar", "baz"])).toThrowError(
      "Creator is not present in list."
    );
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
    const game = makeNewGame("bar", ["foo", "bar", "baz"]);
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
    const game = makeNewGame("bar", ["foo", "bar", "baz"]);
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
    const game = makeNewGame("bar", ["foo", "bar", "baz"]) as any;

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
    const game = makeNewGame("foo", ["foo", "bar", "baz", "kuk"]) as any;

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
    const game = makeNewGame("foo", ["foo", "bar", "baz", "kuk"]) as any;

    game.users[1].bet = 10;
    game.users[2].bet = 20;
    game.turn = 3;
    expect(() => handleBet(19)(game)).toThrowError(
      "Amount 19 is insufficient. Minimum should be 20."
    );
  });

  it("should apply normal bet if it is too low and user is all in", () => {
    const game = makeNewGame("foo", ["foo", "bar", "baz", "kuk"]) as any;

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
    const game = makeNewGame("foo", ["foo", "bar", "baz", "kuk"]);
    const expected =
      'User "bar" of index 1 is not allowed to play on this turn.\n' +
      'Expecting "foo" of index 0 to play.';

    expect(() =>
      gameReducer(game, toAction({ bet: 3, userId: "bar" }))
    ).toThrowError(expected);
  });

  it("should throw if user plays and not enough users", () => {
    const game = makeNewGame("foo", ["foo"]);

    expect(() =>
      gameReducer(game, toAction({ bet: 3, userId: "foo" }))
    ).toThrowError("Not enough users in game to play.");
  });

  it("should increment turn", () => {
    const game = makeNewGame("foo", ["foo", "bar", "baz"]);
    const result = gameReducer(game, toAction({ userId: "foo" }));
    expect(result.turn).toEqual(1);
  });

  it("should increment turn and ignore folded users", () => {
    const game = makeNewGame("foo", ["foo", "bar", "baz", "kuk"]);

    const moves: Move[] = [
      { userId: "foo" },
      { userId: "bar" },
      { userId: "baz", bet: "fold" },
      { userId: "kuk", bet: 20 },
      { userId: "foo", bet: 20 },
      { userId: "bar", bet: 10 }
    ];

    const actions = moves.map(toAction);

    const result = actions.reduce(gameReducer, game);
    expect(result.turn).toEqual(3);
  });

  it("should flop", () => {
    const game = makeNewGame("bar", ["foo", "bar", "baz"]);

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
      turn: 2,
      startTurn: 1,
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

  const result3 = moves3.map(toAction).reduce(gameReducer, result2);
  expect(result3).toEqual({
    flop: ["MockCard", "MockCard", "MockCard", "MockCard", "MockCard"],
    pot: 300,
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
        tokens: 910,
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
        tokens: 910,
        userId: "boz"
      }
    ]
  });

  // /**
  //  * Check that the sum of all provided bets + initial small and big bets
  //  * add up to the final pot
  //  */
  expect(
    [...moves1, ...moves2, ...moves3].reduce((acc, { bet: bet }) => {
      return acc + (typeof bet === "number" ? bet : 0);
    }, 0) + 30
  ).toEqual(result3.pot);

  expect(() => {
    gameReducer(result3, {
      type: "bet",
      payload: { userId: "boz", bet: 4 }
    });
  }).toThrowError("Game is finished. No more turns allowed.");

  const result4 = gameReducer(result3, { type: "reset" });
  expect(result4).toEqual({
    deck: new Array(20).fill("MockCard"),
    flop: null,
    pot: 300,
    startTurn: 1,
    turn: 1,
    users: [
      { bet: null, hand: null, tokens: 970, userId: "foo" },
      { bet: null, hand: null, tokens: 910, userId: "bar" },
      { bet: null, hand: null, tokens: 910, userId: "baz" },
      { bet: null, hand: null, tokens: 1000, userId: "kuk" },
      { bet: null, hand: null, tokens: 910, userId: "boz" }
    ]
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
