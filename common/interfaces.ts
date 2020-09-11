import { Profile } from "passport-google-oauth20";

export interface ChatMessage {
  text: string;
  user: Profile;
  date: number;
}

export interface GameData {
  tokens: number;
  blind?: number;
  hisTurn?: boolean;
  hand?: [any, any];
}

export interface GameDataWIP {
  userId: string;
  data?: {
    tokens: number;
    blind: number | null;
    hisTurn: boolean;
    hand: [any, any];
  };
}
export interface UserData {
  profile: Profile;
  gameData: GameData;
  online: boolean;
}

interface GamePokerData {
  flop: [any, any, any] | null;
  turn: number;
}
