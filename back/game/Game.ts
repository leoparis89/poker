import * as shortid from "shortid";
import { UserSocket } from "../interfaces";
import { Profile } from "passport-google-oauth20";
import { usersDb } from "../db/users";
import { ChatMessage } from "../../common/interfaces";
import { socketManager } from "./SocketManager";

type userId = string;
interface GameData {
  score: number;
}
export class Game {
  id: string;
  players = new Map<userId, GameData>();
  messages: ChatMessage[] = [];

  constructor(public creatorId: userId) {
    this.id = shortid.generate();
  }

  broadcastChat = (user: Profile, text) => {
    const chatMessage: ChatMessage = {
      date: Date.now(),
      text,
      user
    };

    this.broadcast("chat-message", chatMessage);
    this.messages.push(chatMessage);
  };

  addListeners(socket: UserSocket) {
    const userId = socket.request.user.id;
    const user = usersDb.get(userId);
    if (!user) {
      throw new Error(`User with id ${userId} does not exist`);
    }

    const handleChatText = text => this.broadcastChat(user, text);
    const handleQuitGame = () => this.removePlayer(userId);

    socket.on("chat-text", handleChatText);
    socket.on("quit-game", handleQuitGame);
  }

  removeListeners(socket: UserSocket) {
    socket.removeAllListeners();
  }

  connect(socket: UserSocket) {
    const userId = socket.request.user.id;

    if (!this.hasPlayer(userId)) {
      this.addPlayer(userId);
    }

    this.addListeners(socket);
    socket.emit("join-success", this.id);
    this.refresh(socket);
  }

  refresh(socket: UserSocket) {
    socket.emit("connected-users", this.getConnectedUsers());
    socket.emit("chat-history", this.messages);
  }

  hasPlayer(userId: userId) {
    return !!this.players.get(userId);
  }

  addPlayer(userId: userId) {
    this.players.set(userId, { score: 0 });
    this.broadcastConnectedUsers();
  }

  broadcastConnectedUsers() {
    this.broadcast("connected-users", this.getConnectedUsers());
  }

  removePlayer(userId: userId) {
    this.players.delete(userId);
    this.broadcastConnectedUsers();
  }

  getConnectedUsers() {
    const payload: Profile[] = [];
    for (const id of this.players.keys()) {
      payload.push(usersDb.get(id)!);
    }
    return payload;
  }

  broadcast(topic: string, payload: any) {
    const playerIds = [...this.players.keys()];
    socketManager.emitToUsers(playerIds, topic, payload);
  }
}
