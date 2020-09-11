export type GameData = ReadOnly<_GameData>;
export type UserGameData = ReadOnly<_UserGameData>;
export type Move = ReadOnly<_Move>;

type ReadOnly<T> = { +readonly [K in keyof T]: T[K] };
interface _GameData {
  users: UserGameData[];
  flop: [any, any, any, any?, any?] | null;
  turn: number;
  pot: number;
}

interface _UserGameData {
  userId: string;
  tokens: number;
  blind: number | null | "fold";
  hand: [any, any];
}

interface _Move {
  userId: string;
  blind?: number | "fold";
}
