import { Socket } from "socket.io";

export type UserSocket = Socket & {
  request: {
    user: IGoogleProfile;
  };
};
