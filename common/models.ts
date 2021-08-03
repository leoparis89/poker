import { Profile } from "passport-google-oauth20";
import { UserGameData, GameDataCore } from "back/src/game/game-engine/models";

export interface ChatMessage {
  text: string;
  user: Profile;
  date: number;
}

export interface UserSession {
  profile: Profile;
  online: boolean;
}

export type GameDataUI = Omit<GameDataCore, "deck"> & {
  id: string;
  creatorId: string;
};

export type GameData = GameDataCore | GameDataUI;

export type RankSuit = string;

export interface GameStateUI {
  players: UserSession[];
  gameData: GameDataUI;
}
