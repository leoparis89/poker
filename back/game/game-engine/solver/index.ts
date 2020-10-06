import { Hand } from "pokersolver";
import { FullFlop, UserGameData } from "../models";
import { RankSuit } from "../../../../common/models";

export const getWinners = (
  hands: [RankSuit, RankSuit][],
  fullFlop: FullFlop
): { hand: [RankSuit, RankSuit]; result: { descr: string } }[] => {
  const contenders = hands.reduce((acc, hand) => {
    const fullHand = [...hand, ...fullFlop];
    acc.push({ hand, result: Hand.solve(fullHand) });
    return acc;
  }, [] as any);

  const winners = Hand.winners(contenders.map(c => c.result));
  return contenders.filter(c => winners.includes(c.result));
};

export type WinnerInfo = {
  winnerIndex: number;
  descr: string;
};

export const getWinnerIndos = (
  users: UserGameData[],
  flop: FullFlop
): WinnerInfo[] => {
  const result: WinnerInfo[] = [];
  const winningHands = getWinners(
    users.map(u => u.hand!),
    flop
  );

  users.forEach((user, i) => {
    for (const winningHand of winningHands) {
      if (JSON.stringify(user.hand) === JSON.stringify(winningHand.hand)) {
        result.push({ winnerIndex: i, descr: winningHand.result.descr });
      }
    }
  });
  return result;
};
