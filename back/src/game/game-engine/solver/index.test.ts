import { Hand } from "pokersolver";
import { getWinners, getWinnerIndos } from ".";
import { UserGameData, FullFlop } from "../models";

test("poker solver smoke test", () => {
  var hand1 = Hand.solve(["Ad", "As", "Jc", "Th", "2d", "3c", "Kd"]);
  var hand2 = Hand.solve(["Ad", "As", "Jc", "Th", "2d", "Qs", "Qd"]);
  var [winner] = Hand.winners([hand1, hand2]); // hand2
  expect(winner).toEqual(hand2);
});

describe("getWinners", () => {
  it("should return the right value (case one hand wins)", () => {
    const result = getWinners(
      [
        ["AD", "AS"],
        ["AH", "4D"]
      ],
      ["JC", "TH", "AC", "3C", "KD"]
    );
    expect(result[0].hand).toEqual(["AD", "AS"]);
    expect(result[0].result.descr).toEqual("Three of a Kind, A's");
    expect(result.length).toEqual(1);
  });

  it("should return the right value (case two hands wins)", () => {
    const result = getWinners(
      [
        ["AD", "5S"],
        ["AH", "7D"]
      ],
      ["JC", "TH", "AC", "3C", "KD"]
    );
    expect(result[0].hand).toEqual(["AD", "5S"]);
    expect(result[0].result.descr).toEqual("Pair, A's");
    expect(result[1].hand).toEqual(["AH", "7D"]);
    expect(result[0].result.descr).toEqual("Pair, A's");
    expect(result.length).toEqual(2);
  });
});

describe("getWinnerIndexes", () => {
  it("should return the right value (one winner)", () => {
    const users = [
      { hand: ["4D", "5S"] },
      { hand: ["2G", "7D"] },
      { hand: ["AG", "7D"] }
    ] as UserGameData[];

    const fullFlop: FullFlop = ["JC", "TH", "AC", "3C", "KD"];

    expect(getWinnerIndos(users, fullFlop)).toEqual([
      { descr: "Pair, A's", winnerIndex: 2 }
    ]);
  });

  it("should return the right value (two winners)", () => {
    const users = [
      { hand: ["AD", "5S"] },
      { hand: ["2G", "7D"] },
      { hand: ["AG", "7D"] }
    ] as UserGameData[];

    const fullFlop: FullFlop = ["JC", "TH", "AC", "3C", "KD"];

    expect(getWinnerIndos(users, fullFlop)).toEqual([
      { descr: "Pair, A's", winnerIndex: 0 },
      { descr: "Pair, A's", winnerIndex: 2 }
    ]);
  });
});
