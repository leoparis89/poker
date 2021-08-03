import { RankSuit } from "common/models";
import { WinnerInfo, WinnerInfoWithAmount } from "./solver";

export type GameDataCore = ReadOnly<_GameDataCore>;
export type UserGameData = ReadOnly<_UserGameData>;
export type Move = ReadOnly<_Move>;
export type Action = ReadOnly<_Action>;

export type ReadOnly<T> = { +readonly [K in keyof T]: T[K] };

export type userId = string;

type _Action = BetAction | PlayerAction | DealAction;
interface BetAction {
  type: "bet";
  payload: Move;
}

interface PlayerAction {
  type: "add-player" | "remove-player";
  payload: userId;
}

interface DealAction {
  type: "deal";
  payload: userId;
}

interface _GameDataCore {
  users: UserGameData[];
  flop: [RankSuit, RankSuit, RankSuit, RankSuit?, RankSuit?] | null;
  turn: number;
  startTurn: number;
  pot: number;
  deck: RankSuit[];
  winners?: WinnerInfoWithAmount[];
}

interface _UserGameData {
  userId: string;
  tokens: number;
  bet: number | null | "fold";
  hand: Hand | null;
}

interface _Move {
  userId: string;
  bet?: number | "fold";
}

export type Hand = [RankSuit, RankSuit];
export type FullFlop = [RankSuit, RankSuit, RankSuit, RankSuit, RankSuit];
