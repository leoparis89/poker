import * as shortid from "shortid";
import Socket from "socket.io";
import { UserSocket } from "../interfaces";
import { Profile } from "passport-google-oauth20";
import { usersDb } from "../db/users";

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
    if (existingSockets) {
      existingSockets.push(socket);
    } else {
      this.addNewUserSocket(socket);
    }
    this.broadcastConnectedUsers();
  }

  addNewUserSocket(socket: UserSocket) {
    const id = socket.request.user.id;
    this.sockets.set(id, [socket]);
  }

  removePlayer(id: userId) {
    this.sockets.delete(id);
    this.broadcastConnectedUsers();
  }

  broadcastConnectedUsers() {
    const payload: Profile[] = [];
    for (const id of this.sockets.keys()) {
      payload.push(usersDb.get(id)!);
    }
    this.broadcast("connected-users", payload);
  }

  broadcast(topic: string, payload: any) {
    this.sockets.forEach(userSockets => {
      userSockets.forEach(socket => {
        socket.emit(topic, payload);
      });
    });
  }

  disconnect(socket: UserSocket) {
    const id = socket.request.user.id;
    const userSockets = this.sockets.get(id);

    if (!userSockets || !userSockets.find(s => s === socket)) {
      throw new Error(`No socket with id ${id} found in game.`);
    }

    const newUserSockets = userSockets.filter(s => s !== socket);

    if (!newUserSockets.length) {
      this.removePlayer(id);
      return;
    }

    this.sockets.set(id, newUserSockets);
  }
}
