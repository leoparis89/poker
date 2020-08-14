import { Profile } from "passport-google-oauth20";
import { Socket } from "socket.io";

export type UserSocket = Socket & {
  request: {
    user: Profile;
  };
};
