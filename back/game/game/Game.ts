import { Profile } from "passport-google-oauth20";
import * as shortid from "shortid";
import { ChatMessage, GameStateUI, UserSession } from "../../../common/models";
import { usersDb } from "../../db/users";
import { UserSocket } from "../../models";
import { newGame } from "../game-engine/actionHandlers";
import { gameReducer } from "../game-engine/gameReducer.";
import { GameDataCore, Action } from "../game-engine/models";
import { socketManager } from "../socket-manager/SocketManager";

type userId = string;

class GameCore {
  id: string;
  players = new Map<userId, UserSession>(); // TODO no game info saved in here
  messages: ChatMessage[] = [];
  gameData: GameDataCore;

  constructor(public creatorId: userId) {
    this.id = shortid.generate();
    this.gameData = newGame();

    this.applyAction({
      type: "add-player",
      payload: creatorId
    });
  }

  hasPlayer(userId: userId) {
    return !!this.players.get(userId);
  }

  addPlayer(userId: userId) {
    const profile = usersDb.get(userId)!;
    this.players.set(userId, {
      online: true,
      profile
    });

    if (this.gameData.users.find(u => u.userId === userId)) {
      return;
    }

    this.applyAction({
      type: "add-player",
      payload: userId
    });
  }
  removePlayer(userId: userId) {
    this.players.delete(userId);
  }

  getPlayerGameDatas(): GameStateUI {
    const { deck, ...dataWithoutDeck } = this.gameData;

    const result: UserSession[] = [];
    this.players.forEach(val => result.push(val));

    return {
      players: result,
      gameData: { ...dataWithoutDeck, id: this.id, creatorId: this.creatorId }
    };
  }

  protected updateOnline(userId: userId, online: boolean) {
    const userData = this.players.get(userId)!;
    if (userData) {
      this.players.set(userId, { ...userData, online });
      return true;
    }
    return false;
  }

  deal(userId: string) {
    this.applyAction({
      type: "reset"
    });
    this.applyAction({
      type: "deal"
    });
  }

  bet(amount: number | "fold", userId: string) {
    this.applyAction({
      type: "bet",
      payload: { bet: amount, userId }
    });
  }

  private applyAction(action: Action) {
    this.gameData = gameReducer(this.gameData, action);
  }
}

export class Game extends GameCore {
  constructor(creatorId) {
    super(creatorId);

    const handleOnlineState = (online: boolean) => userId => {
      if (this.updateOnline(userId, online)) {
        this.broadbastGameData();
      }
    };

    socketManager.emitter
      .on("user-online", handleOnlineState(true))
      .on("user-offline", handleOnlineState(false));
  }

  connect(socket: UserSocket) {
    const userId = socket.request.user.id;

    this.addPlayer(userId);
    this.addListeners(socket);
    this.broadbastGameData();

    this.refresh(socket);
  }

  addListeners(socket: UserSocket) {
    const userId = socket.request.user.id;
    const user = usersDb.get(userId);
    if (!user) {
      throw new Error(`User with id ${userId} does not exist`);
    }

    const handleChatText = text => this.broadcastChat(user, text);
    const handleQuitGame = () => {
      this.removePlayer(userId);
      this.broadbastGameData();
      socket.emit("quit-game");
    };
    const handleDeal = () => {
      this.deal(userId);
      this.broadbastGameData();
    };
    const handleBet = amount => {
      this.bet(amount, userId);
      this.broadbastGameData();
    };

    socket.on("chat-text", handleChatText);
    socket.on("quit-game-request", handleQuitGame);
    socket.on("deal", handleDeal);
    socket.on("bet", handleBet);
  }

  removeListeners(socket: UserSocket) {
    socket.removeAllListeners();
  }

  refresh(socket: UserSocket) {
    // socket.emit("game-data", this.getPlayerGameDatas());
    socket.emit("chat-history", this.messages);
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

  broadbastGameData() {
    const data = this.getPlayerGameDatas();
    this.broadcast("game-data", data);
  }

  broadcast(topic: string, payload: any) {
    const playerIds = [...this.players.keys()];
    socketManager.emitToUsers(playerIds, topic, payload);
  }
}
