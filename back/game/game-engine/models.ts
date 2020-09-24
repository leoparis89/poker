import { RankSuit } from "../../../common/interfaces";

export type GameDataCore = ReadOnly<_GameDataCore>;
export type UserGameData = ReadOnly<_UserGameData>;
export type Move = ReadOnly<_Move>;
export type Action = ReadOnly<_Action>;

export type ReadOnly<T> = { +readonly [K in keyof T]: T[K] };

export type userId = string;

type _Action = BetAction | PlayerAction | DealAction | ResetAction;
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
}
interface ResetAction {
  type: "reset";
}

interface _GameDataCore {
  users: UserGameData[];
  flop: [RankSuit, RankSuit, RankSuit, RankSuit?, RankSuit?] | null;
  turn: number | null;
  startTurn: number | null;
  pot: number;
  deck: RankSuit[];
}

interface _UserGameData {
  userId: string;
  tokens: number;
  bet: number | null | "fold";
  hand: [RankSuit, RankSuit] | null;
}

interface _Move {
  userId: string;
  bet?: number | "fold";
}
