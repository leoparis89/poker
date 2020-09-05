import { Profile } from "passport-google-oauth20";

export interface ChatMessage {
  text: string;
  user: Profile;
  date: number;
}

export interface GameData {
  score: number;
  online: boolean;
}

export interface UserData {
  profile: Profile;
  gameData: GameData;
}
