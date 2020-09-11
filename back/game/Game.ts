import * as shortid from "shortid";

import { UserSocket } from "../interfaces";
import { Profile } from "passport-google-oauth20";
import { usersDb } from "../db/users";
import { ChatMessage, UserData } from "../../common/interfaces";
import { socketManager } from "./SocketManager";
import { GameData } from "../../common/interfaces";

type userId = string;
export class Game {
  id: string;
  players = new Map<userId, UserData>();
  messages: ChatMessage[] = [];

  constructor(public creatorId: userId) {
    this.id = shortid.generate();

    socketManager.emitter
      .on("add-user", userId => this.updateOnline(userId, true))
      .on("remove-user", userId => this.updateOnline(userId, false));
  }

  private updateOnline(userId: userId, online: boolean) {
    const userData = this.players.get(userId)!;
    if (userData) {
      this.players.set(userId, { ...userData, online });
    }
    this.broadcastPlayers();
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
    const handleQuitGame = () => {
      this.removePlayer(userId);
      socket.emit("quit-game");
    };

    socket.on("chat-text", handleChatText);
    socket.on("quit-game-request", handleQuitGame);
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
    socket.emit("connected-users", this.getPlayerGameDatas());
    socket.emit("chat-history", this.messages);
  }

  hasPlayer(userId: userId) {
    return !!this.players.get(userId);
  }

  addPlayer(userId: userId) {
    const profile = usersDb.get(userId)!;
    this.players.set(userId, {
      online: true,
      profile,
      gameData: { tokens: 0 }
    });
    this.broadcastPlayers();
  }

  broadcastPlayers() {
    this.broadcast("connected-users", this.getPlayerGameDatas());
  }

  removePlayer(userId: userId) {
    this.players.delete(userId);
    this.broadcastPlayers();
  }

  getPlayerGameDatas(): UserData[] {
    const result: UserData[] = [];
    this.players.forEach((userData, userId) => {
      result.push(userData);
    });
    return result;
  }

  broadcast(topic: string, payload: any) {
    const playerIds = [...this.players.keys()];
    socketManager.emitToUsers(playerIds, topic, payload);
  }
}
