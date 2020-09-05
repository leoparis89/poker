import { Profile } from "passport-google-oauth20";

export interface ChatMessage {
  text: string;
  user: Profile;
  date: number;
}
