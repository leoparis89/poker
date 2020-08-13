import * as shortid from "shortid";
import Socket from "socket.io";
import { UserSocket } from "../interfaces";

type userId = string;
export class Game {
  id: string;
  sockets = new Map<userId, Socket.Socket[]>();

  constructor(public creatorId: string) {
    this.id = shortid.generate();
  }

  connect(socket: UserSocket) {
    const id = socket.request.user.id;
    const existingSockets = this.sockets.get(id);
    if (!existingSockets) {
      this.sockets.set(id, [socket]);
    } else {
      existingSockets.push(socket);
    }
  }

  disconnect(socket: UserSocket) {
    const id = socket.request.user.id;
    const existingSockets = this.sockets.get(id);
    if (!existingSockets) {
      return;
    } else {
      this.sockets.set(
        id,
        existingSockets.filter(s => s !== socket)
      );
    }
  }
}
