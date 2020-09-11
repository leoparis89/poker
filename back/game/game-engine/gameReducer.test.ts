import {
  gameReducer,
  getLastBlind,
  handleBlind,
  makeNewGame,
  playsersAreEven
} from "./gameReducer";
import { UserGameData, Move } from "./models";

describe("makeNewGame", () => {
  it("should return the right value", () => {
    const expected = {
      flop: null,
      turn: 1,
      pot: 0,
      users: [
        { blind: null, hand: [4, 4], tokens: 1000, userId: "foo" },
        { blind: null, hand: [4, 4], tokens: 1000, userId: "bar" },
        { blind: null, hand: [4, 4], tokens: 1000, userId: "baz" }
      ]
    };
    expect(makeNewGame("bar", ["foo", "bar", "baz"])).toEqual(expected);
  });
});
describe("getLastBlind", () => {
  it("should return the right value", () => {
    const users = ([
      {
        userId: "foo",
        blind: 40,
        tokens: 100
      },
      {
        userId: "bar",
        blind: "fold",
        tokens: 100
      },
      {
        userId: "baz",
        blind: null,
        tokens: 100
      },
      {
        userId: "kuk",
        blind: null,
        tokens: 100
      }
    ] as UserGameData[]) as any;
    expect(getLastBlind(users, 2)).toEqual(40);
    expect(getLastBlind(users, 3)).toEqual(null);

    users[1].blind = 80;
    expect(getLastBlind(users, 2)).toEqual(80);
  });

  it("should return the right value (case a user is all in)", () => {
    const users = [
      {
        userId: "foo",
        blind: 40,
        tokens: 60
      },
      {
        userId: "bar",
        blind: "fold",
        tokens: 100
      },
      {
        userId: "baz",
        blind: 30,
        tokens: 0
      },
      {
        userId: "kuk",
        blind: null,
        tokens: 100
      }
    ] as UserGameData[];
    expect(getLastBlind(users, 3)).toEqual(40);
  });

  it("should return the right value (edge case with cycle)", () => {
    const users = [
      {
        userId: "foo",
        blind: "fold",
        tokens: 100
      },
      {
        userId: "bar",
        blind: "fold",
        tokens: 100
      },
      {
        userId: "baz",
        blind: null,
        tokens: 100
      },
      {
        userId: "kuk",
        blind: 50,
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
        blind: 30,
        tokens: 100
      },
      {
        userId: "bar",
        blind: 30,
        tokens: 100
      },
      {
        userId: "baz",
        blind: 30,
        tokens: 100
      },
      {
        userId: "kuk",
        blind: 30,
        tokens: 100
      }
    ] as UserGameData[];

    expect(playsersAreEven(users)).toEqual(true);
  });

  it("should return the right value (case player folded)", () => {
    const users = [
      {
        userId: "foo",
        blind: 30,
        tokens: 100
      },
      {
        userId: "bar",
        blind: 30,
        tokens: 100
      },
      {
        userId: "baz",
        blind: "fold",
        tokens: 100
      },
      {
        userId: "kuk",
        blind: 30,
        tokens: 100
      }
    ] as UserGameData[];

    expect(playsersAreEven(users)).toEqual(true);
  });

  it("should return the right value (case player didn't play)", () => {
    const users = [
      {
        userId: "foo",
        blind: 30,
        tokens: 100
      },
      {
        userId: "bar",
        blind: 30,
        tokens: 100
      },
      {
        userId: "baz",
        blind: null,
        tokens: 100
      },
      {
        userId: "kuk",
        blind: 30,
        tokens: 100
      }
    ] as UserGameData[];

    expect(playsersAreEven(users)).toEqual(false);
  });
});

describe("handleBlind", () => {
  it("should apply flold to users", () => {
    const game = makeNewGame("bar", ["foo", "bar", "baz"]);
    const result = handleBlind("fold")({ ...game, turn: 1 });
    expect(result.users).toEqual([
      { blind: null, hand: [4, 4], tokens: 1000, userId: "foo" },
      { blind: "fold", hand: [4, 4], tokens: 1000, userId: "bar" },
      { blind: null, hand: [4, 4], tokens: 1000, userId: "baz" }
    ]);
  });

  it("should apply small blind to users", () => {
    const game = makeNewGame("bar", ["foo", "bar", "baz"]);
    const result = handleBlind()(game);
    expect(result.users).toEqual([
      { blind: null, hand: [4, 4], tokens: 1000, userId: "foo" },
      { blind: 10, hand: [4, 4], tokens: 990, userId: "bar" },
      { blind: null, hand: [4, 4], tokens: 1000, userId: "baz" }
    ]);
  });

  it("should apply big blind to users", () => {
    const game = makeNewGame("bar", ["foo", "bar", "baz"]) as any;

    game.users[1].blind = 10;
    game.turn = 2;
    const result = handleBlind()(game);
    expect(result.users).toEqual([
      { blind: null, hand: [4, 4], tokens: 1000, userId: "foo" },
      { blind: 10, hand: [4, 4], tokens: 1000, userId: "bar" },
      { blind: 20, hand: [4, 4], tokens: 980, userId: "baz" }
    ]);
  });

  it("should apply normal blind to users", () => {
    const game = makeNewGame("foo", ["foo", "bar", "baz", "kuk"]) as any;

    game.users[1].blind = 10;
    game.users[2].blind = 20;
    game.turn = 3;
    const result = handleBlind(40)(game);
    expect(result.users).toEqual([
      { blind: null, hand: [4, 4], tokens: 1000, userId: "foo" },
      { blind: 10, hand: [4, 4], tokens: 1000, userId: "bar" },
      { blind: 20, hand: [4, 4], tokens: 1000, userId: "baz" },
      { blind: 40, hand: [4, 4], tokens: 960, userId: "kuk" }
    ]);
  });

  it("should throw if normal blind is too low and user is not all in", () => {
    const game = makeNewGame("foo", ["foo", "bar", "baz", "kuk"]) as any;

    game.users[1].blind = 10;
    game.users[2].blind = 20;
    game.turn = 3;
    expect(() => handleBlind(19)(game)).toThrowError(
      "Amount 19 is insufficient. Minimum should be 20."
    );
  });

  it("should apply normal blind if it is too low and user is all in", () => {
    const game = makeNewGame("foo", ["foo", "bar", "baz", "kuk"]) as any;

    game.users[1].blind = 10;
    game.users[2].blind = 20;
    game.users[3].tokens = 19;
    game.turn = 3;
    expect(handleBlind(19)(game).users).toEqual([
      { blind: null, hand: [4, 4], tokens: 1000, userId: "foo" },
      { blind: 10, hand: [4, 4], tokens: 1000, userId: "bar" },
      { blind: 20, hand: [4, 4], tokens: 1000, userId: "baz" },
      { blind: 19, hand: [4, 4], tokens: 0, userId: "kuk" }
    ]);
  });
});

describe("gameReducer", () => {
  it("should throw if wrong user plays", () => {
    const game = makeNewGame("foo", ["foo", "bar", "baz", "kuk"]);
    const expected =
      'User "bar" of index 1 is not allowed to play on this turn.\n' +
      'Expecting "foo" of index 0 to play.';

    expect(() => gameReducer(game, { blind: 3, userId: "bar" })).toThrowError(
      expected
    );
  });

  it("should increment turn", () => {
    const game = makeNewGame("foo", ["foo", "bar", "baz"]);
    const result = gameReducer(game, { userId: "foo" });
    expect(result.turn).toEqual(1);
  });

  it("should increment turn and ignore folded users", () => {
    const game = makeNewGame("foo", ["foo", "bar", "baz", "kuk"]);

    const moves = [
      { userId: "foo" },
      { userId: "bar" },
      { userId: "baz", blind: "fold" },
      { userId: "kuk", blind: 20 },
      { userId: "foo", blind: 20 },
      { userId: "bar", blind: 10 }
    ] as Move[];

    const result = moves.reduce(gameReducer, game);
    expect(result.turn).toEqual(3);
  });

  it("should flop", () => {
    const game = makeNewGame("bar", ["foo", "bar", "baz"]);

    const moves = [
      { userId: "bar" },
      { userId: "baz" },
      { userId: "foo", blind: 20 },
      { userId: "bar", blind: 10 }
    ] as Move[];

    const result = moves.reduce(gameReducer, game);
    const expected = {
      flop: [4, 4, 4],
      pot: 60,
      turn: 2,
      users: [
        { blind: null, hand: [4, 4], tokens: 980, userId: "foo" },
        { blind: null, hand: [4, 4], tokens: 980, userId: "bar" },
        { blind: null, hand: [4, 4], tokens: 980, userId: "baz" }
      ]
    };

    expect(result).toEqual(expected);
  });

  test("complete scenario", () => {
    const game = makeNewGame("foo", ["foo", "bar", "baz", "kuk", "boz"]);
    const moves1 = [
      { userId: "foo" },
      { userId: "bar" },
      { userId: "baz", blind: 30 },
      { userId: "kuk", blind: "fold" },
      { userId: "boz", blind: 30 },
      { userId: "foo", blind: 20 },
      { userId: "bar", blind: 10 }
    ] as Move[];

    const result1 = moves1.reduce(gameReducer, game);
    expect(result1).toEqual({
      flop: [4, 4, 4],
      pot: 120,
      turn: 2,
      users: [
        { blind: null, hand: [4, 4], tokens: 970, userId: "foo" },
        { blind: null, hand: [4, 4], tokens: 970, userId: "bar" },
        { blind: null, hand: [4, 4], tokens: 970, userId: "baz" },
        { blind: "fold", hand: [4, 4], tokens: 1000, userId: "kuk" },
        { blind: null, hand: [4, 4], tokens: 970, userId: "boz" }
      ]
    });

    const moves2 = [
      { userId: "baz", blind: 0 },
      { userId: "boz", blind: 0 },
      { userId: "foo", blind: "fold" },
      { userId: "bar", blind: 0 }
    ] as Move[];

    const result2 = moves2.reduce(gameReducer, result1);
    expect(result2).toEqual({
      flop: [4, 4, 4, 4],
      pot: 120,
      turn: 2,
      users: [
        { blind: "fold", hand: [4, 4], tokens: 970, userId: "foo" },
        { blind: null, hand: [4, 4], tokens: 970, userId: "bar" },
        { blind: null, hand: [4, 4], tokens: 970, userId: "baz" },
        { blind: "fold", hand: [4, 4], tokens: 1000, userId: "kuk" },
        { blind: null, hand: [4, 4], tokens: 970, userId: "boz" }
      ]
    });

    const moves3 = [
      { userId: "baz", blind: 50 },
      { userId: "boz", blind: 60 },
      { userId: "bar", blind: 60 },
      { userId: "baz", blind: 10 }
    ] as Move[];
    const result3 = moves3.reduce(gameReducer, result2);
    expect(result3).toEqual({
      flop: [4, 4, 4, 4, 4],
      pot: 300,
      turn: 4,
      users: [
        { blind: "fold", hand: [4, 4], tokens: 970, userId: "foo" },
        { blind: null, hand: [4, 4], tokens: 910, userId: "bar" },
        { blind: null, hand: [4, 4], tokens: 910, userId: "baz" },
        { blind: "fold", hand: [4, 4], tokens: 1000, userId: "kuk" },
        { blind: null, hand: [4, 4], tokens: 910, userId: "boz" }
      ]
    });

    /**
     * Check that the sum of all provided bets + initial small and big blinds
     * add up to the final pot
     */
    expect(
      [...moves1, ...moves2, ...moves3].reduce((acc, { blind }) => {
        return acc + (typeof blind === "number" ? blind : 0);
      }, 0) + 30
    ).toEqual(result3.pot);

    expect(() => {
      gameReducer(result3, { userId: "boz", blind: 4 });
    }).toThrowError("Game is finished. No more turns allowed.");
  });

  test("complete scenario 2", () => {
    const game = makeNewGame("foo", ["foo", "bar", "baz", "kuk", "boz"]);

    (game.users as any)[3].tokens = 100;
    const moves1 = [
      { userId: "foo" },
      { userId: "bar" },
      { userId: "baz", blind: 500 },
      { userId: "kuk", blind: 100 },
      { userId: "boz", blind: 500 },
      { userId: "foo", blind: 490 },
      { userId: "bar", blind: 480 }
    ] as Move[];

    const result1 = moves1.reduce(gameReducer, game);
    expect(result1).toEqual({
      flop: [4, 4, 4],
      pot: 2100,
      turn: 2,
      users: [
        { blind: null, hand: [4, 4], tokens: 500, userId: "foo" },
        { blind: null, hand: [4, 4], tokens: 500, userId: "bar" },
        { blind: null, hand: [4, 4], tokens: 500, userId: "baz" },
        { blind: null, hand: [4, 4], tokens: 0, userId: "kuk" },
        { blind: null, hand: [4, 4], tokens: 500, userId: "boz" }
      ]
    });
  });
});

//   it("should increment turn", () => {
//     const gameData: GameData = {
//       flop: null,
//       turn: 1,
//       dealer: 0,
//       users: [
//         {
//           userId: "foo"i,
//           blind: null,
//           tokens: 100
//         } as UserGameData,
//         {
//           userId: "bar",
//           blind: null,
//           tokens: 100
//         } as UserGameData,
//         {
//           userId: "baz",
//           blind: null,
//           tokens: 100
//         } as UserGameData
//       ]
//     };

//     const turn = gameReducer(gameData, { userId: "bar" })?.turn;
//     expect(turn).toEqual(2);
//   });

//   it("should increment turn (edge case last player in list)", () => {
//     const gameData: GameData = {
//       flop: null,
//       turn: 2,
//       dealer: 0,
//       users: [
//         {
//           userId: "foo",
//           blind: null,
//           tokens: 100
//         } as UserGameData,
//         {
//           userId: "bar",
//           blind: null,
//           tokens: 100
//         } as UserGameData,
//         {
//           userId: "baz",
//           blind: null,
//           tokens: 100
//         } as UserGameData
//       ]
//     };

//     const turn = gameReducer(gameData, { userId: "baz" })?.turn;
//     expect(turn).toEqual(0);
//   });
//   it("should attribute small blind", () => {
//     const gameData: GameData = {
//       flop: null,
//       turn: 1,
//       dealer: 0,
//       users: [
//         {
//           userId: "foo",
//           blind: null,
//           tokens: 100
//         },
//         {
//           userId: "bar",
//           blind: null,
//           tokens: 100
//         },
//         {
//           userId: "baz",
//           blind: null,
//           tokens: 100
//         }
//       ] as UserGameData[]
//     };

//     const expected = {
//       flop: null,
//       turn: 2,
//       dealer: 0,
//       users: [
//         { blind: null, tokens: 100, userId: "foo" },
//         { blind: 10, tokens: 90, userId: "bar" },
//         { blind: null, tokens: 100, userId: "baz" }
//       ]
//     };
//     expect(gameReducer(gameData, { userId: "bar" })).toEqual(expected);
//   });

//   it("should attribute small blind (case player has less tokens than small blind)", () => {
//     const gameData: GameData = {
//       flop: null,
//       turn: 1,
//       dealer: 0,
//       users: [
//         {
//           userId: "foo",
//           blind: null,
//           tokens: 100
//         },
//         {
//           userId: "bar",
//           blind: null,
//           tokens: 8
//         },
//         {
//           userId: "baz",
//           blind: null,
//           tokens: 100
//         }
//       ] as UserGameData[]
//     };

//     const expected = {
//       flop: null,
//       turn: 2,
//       dealer: 0,
//       users: [
//         { blind: null, tokens: 100, userId: "foo" },
//         { blind: 8, tokens: 0, userId: "bar" },
//         { blind: null, tokens: 100, userId: "baz" }
//       ]
//     };
//     expect(gameReducer(gameData, { userId: "bar" })).toEqual(expected);
//   });

//   it("should attribute big blind", () => {
//     const gameData: GameData = {
//       flop: null,
//       turn: 2,
//       dealer: 0,
//       users: [
//         {
//           userId: "foo",
//           blind: null,
//           tokens: 100
//         } as UserGameData,
//         {
//           userId: "bar",
//           blind: 10,
//           tokens: 100
//         } as UserGameData,
//         {
//           userId: "baz",
//           blind: null,
//           tokens: 100
//         } as UserGameData
//       ]
//     };

//     const expected = {
//       flop: null,
//       turn: 0,
//       dealer: 0,
//       users: [
//         { blind: null, tokens: 100, userId: "foo" },
//         { blind: 10, tokens: 100, userId: "bar" },
//         { blind: 20, tokens: 80, userId: "baz" }
//       ]
//     };
//     expect(gameReducer(gameData, { userId: "baz" })).toEqual(expected);
//   });

//   //   it("should attribute blind", () => {
//   //     const gameData: GameData = {
//   //       global: {
//   //         flop: null,
//   //         turn: 2
//   //       },
//   //       users: [
//   //         {
//   //           userId: "foo",
//   //           blind: 10,
//   //           tokens: 90
//   //         } as UserGameData,
//   //         {
//   //           userId: "bar",
//   //           blind: 20,
//   //           tokens: 80
//   //         } as UserGameData,
//   //         {
//   //           userId: "baz",
//   //           blind: null,
//   //           tokens: 100
//   //         } as UserGameData
//   //       ]
//   //     };

//   //     const expected = {
//   //       global: { flop: null, turn: 0 },
//   //       users: [
//   //         { blind: 10, tokens: 90, userId: "foo" },
//   //         { blind: 20, tokens: 80, userId: "bar" },
//   //         { blind: 33, tokens: 67, userId: "baz" }
//   //       ]
//   //     };
//   //     expect(gameReducer(gameData, { userId: "baz", blind: 33 })).toEqual(
//   //       expected
//   //     );
//   //   });

//   //   it("should throw if it's a normal blind and user has insufficient tokens", () => {
//   //     const gameData: GameData = {
//   //       global: {
//   //         flop: null,
//   //         turn: 2
//   //       },
//   //       users: [
//   //         {
//   //           userId: "foo",
//   //           blind: 10,
//   //           tokens: 90
//   //         } as UserGameData,
//   //         {
//   //           userId: "bar",
//   //           blind: 20,
//   //           tokens: 80
//   //         } as UserGameData,
//   //         {
//   //           userId: "baz",
//   //           blind: null,
//   //           tokens: 32
//   //         } as UserGameData
//   //       ]
//   //     };

//   //     expect(() =>
//   //       gameReducer(gameData, { userId: "baz", blind: 33 })
//   //     ).toThrowError("Insufficient tokens");
//   //   });

//   //   it("should throw if it's a normal blind and user provides no blind", () => {
//   //     const gameData: GameData = {
//   //       global: {
//   //         flop: null,
//   //         turn: 2
//   //       },
//   //       users: [
//   //         {
//   //           userId: "foo",
//   //           blind: 10,
//   //           tokens: 90
//   //         } as UserGameData,
//   //         {
//   //           userId: "bar",
//   //           blind: 20,
//   //           tokens: 80
//   //         } as UserGameData,
//   //         {
//   //           userId: "baz",
//   //           blind: null,
//   //           tokens: 32
//   //         } as UserGameData
//   //       ]
//   //     };

//   //     expect(() => gameReducer(gameData, { userId: "baz" })).toThrowError(
//   //       "Must provide blind"
//   //     );
//   //   });

//   //   it("should throw if user provides a blind that's too low", () => {
//   //     const gameData: GameData = {
//   //       global: {
//   //         flop: null,
//   //         turn: 2
//   //       },
//   //       users: [
//   //         {
//   //           userId: "foo",
//   //           blind: 40,
//   //           tokens: 90
//   //         } as UserGameData,
//   //         {
//   //           userId: "bar",
//   //           blind: 60,
//   //           tokens: 80
//   //         } as UserGameData,
//   //         {
//   //           userId: "baz",
//   //           blind: null,
//   //           tokens: 100
//   //         } as UserGameData
//   //       ]
//   //     };

//   //     expect(() =>
//   //       gameReducer(gameData, { userId: "baz", blind: 59 })
//   //     ).toThrowError("Provided blind 59 is too low. Minimum should be 60");
//   //   });

//   // it("should throw if user provides a blind that's too low (edge case first user of list is playing)", () => {
//   //   const gameData: GameData = {
//   //     global: {
//   //       flop: null,
//   //       turn: 0
//   //     },
//   //     users: [
//   //       {
//   //         userId: "foo",
//   //         blind: null,
//   //         tokens: 90
//   //       } as UserGameData,
//   //       {
//   //         userId: "bar",
//   //         blind: 60,
//   //         tokens: 80
//   //       } as UserGameData,
//   //       {
//   //         userId: "baz",
//   //         blind: 70,
//   //         tokens: 100
//   //       } as UserGameData
//   //     ]
//   //   };

//   //   expect(() =>
//   //     gameReducer(gameData, { userId: "foo", blind: 50 })
//   //   ).toThrowError("Provided blind 50 is too low. Minimum should be 70");
//   // });
//   //   test("startGame should return the right value", () => {
//   //     const expected = [
//   //       {
//   //         data: { blind: null, hand: [4, 4], hisTurn: false, tokens: 1000 },
//   //         userId: "foo"
//   //       },
//   //       {
//   //         data: { blind: 10, hand: [4, 4], hisTurn: false, tokens: 1000 },
//   //         userId: "bar"
//   //       },
//   //       {
//   //         data: { blind: null, hand: [4, 4], hisTurn: true, tokens: 1000 },
//   //         userId: "baz"
//   //       }
//   //     ];
//   //     expect(startGame(["foo", "bar", "baz"], "bar")).toEqual(expected);
//   //   });
//   //   describe("play", () => {});
// });
// describe("should flop", () => {
//   it("should return the right value", () => {
//     const gameData: GameData = {
//       flop: null,
//       turn: 0,
//       dealer: 1,
//       users: [
//         {
//           userId: "foo",
//           blind: 30,
//           tokens: 90
//         },
//         {
//           userId: "bar",
//           blind: 30,
//           tokens: 80
//         },
//         {
//           userId: "baz",
//           blind: 10,
//           tokens: 100
//         },
//         {
//           userId: "baz",
//           blind: 20,
//           tokens: 100
//         }
//       ] as UserGameData[]
//     };
//   });
