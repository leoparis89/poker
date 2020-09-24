import { UserSocket } from "../interfaces";
import { EventEmitter } from "events";

type userId = string;

export class SocketManager {
  sockets = new Map<userId, UserSocket[]>();
  emitter = new EventEmitter();

  addSocket(socket: UserSocket) {
    const id = socket.request.user.id;
    const userSockets = this.sockets.get(id);

    if (!userSockets) {
      this.addUser(id);
      this.addSocket(socket);
      return;
    }
    socket.on("disconnect", () => this.removeSocket(socket));
    userSockets.push(socket);
    console.log(
      `Socket with id ${socket.id} belonging to user ${id} has been added`
    );
  }

  removeSocket(socket) {
    const id = socket.request.user.id;
    const userSockets = this.sockets.get(id);

    if (!userSockets || !userSockets.find(s => s === socket)) {
      throw new Error(`No socket with id ${id} found in game.`);
    }

    const newUserSockets = userSockets.filter(s => s !== socket);

    if (!newUserSockets.length) {
      this.removeUser(id);
    } else {
      this.sockets.set(id, newUserSockets);
    }

    console.log(
      `Socket with id ${socket.id} belonging to user ${id} has been removed`
    );
  }

  emitToUsers(userIds: string[], topic, payload) {
    const userSockets = [...this.sockets].filter(([userId]) =>
      userIds.includes(userId)
    );
    userSockets.forEach(([_, sockets]) => {
      sockets.forEach(socket => socket.emit(topic, payload));
    });
  }

  private addUser(id: userId) {
    this.sockets.set(id, []);
    this.emitter.emit("user-online", id);
  }

  private removeUser(id: userId) {
    this.sockets.delete(id);
    this.emitter.emit("user-offline", id);
  }
}

export const socketManager = new SocketManager();
