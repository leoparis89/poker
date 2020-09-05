import MockDate from "mockdate";
import { Profile } from "passport-google-oauth20";
import shortid from "shortid";
import { usersDb } from "../db/users";
import {
  makeEmitter,
  makeSocket,
  profileMock1,
  profileMock2
} from "../_fixtures";
import { Game } from "./Game";
import { socketManager } from "./SocketManager";
import { EventEmitter } from "events";
import { gameManager } from "./GameManager";
import { eventManager } from "react-toastify/dist/core";

// jest.mock(userSockets);
jest.mock("shortid");
jest.mock("../db/users");
jest.mock("./SocketManager");

beforeAll(() => {
  (shortid.generate as jest.Mock).mockReturnValue("id");

  (usersDb.get as jest.Mock).mockImplementation(id => {
    return {
      id,
      displayName: "display-name-" + id
    } as Profile;
  });

  socketManager.emitter = new EventEmitter();
  MockDate.set("1970-01-02");
});

const createGame = () => new Game("creatorId");

describe("Game", () => {
  it("should initialize with an id and no players", () => {
    const game = createGame();
    expect(game.id).toEqual("id");
    expect(game.players).toEqual(new Map());
  });

  describe("connect", () => {
    it("should send players data to newly connected socket", () => {
      const game = createGame();
      const socket1 = makeSocket("mockId1");
      const socket2 = makeSocket("mockId2");
      game.connect(socket1);
      expect(socket1.emit).toHaveBeenCalledWith("connected-users", [
        {
          gameData: { online: true, score: 0 },
          profile: { displayName: "display-name-mockId1", id: "mockId1" }
        }
      ]);
      game.connect(socket2);
      expect(socket2.emit).toHaveBeenCalledWith("connected-users", [
        {
          gameData: { online: true, score: 0 },
          profile: { displayName: "display-name-mockId1", id: "mockId1" }
        },
        {
          gameData: { online: true, score: 0 },
          profile: { displayName: "display-name-mockId2", id: "mockId2" }
        }
      ]);
    });

    it("should send message history to newly connected socket", () => {
      const game = createGame();

      const socket1 = makeEmitter("mockId1");
      const socket2 = makeEmitter("mockId2");
      socket2.emit = jest.fn();

      game.connect(socket1);
      socket1.emit("chat-text", "hello");
      socket1.emit("chat-text", "world");
      socket1.emit("chat-text", "cool");
      game.connect(socket2);

      expect(socket2.emit).toHaveBeenCalledWith("chat-history", [
        {
          date: 86400000,
          text: "hello",
          user: { displayName: "display-name-mockId1", id: "mockId1" }
        },
        {
          date: 86400000,
          text: "world",
          user: { displayName: "display-name-mockId1", id: "mockId1" }
        },
        {
          date: 86400000,
          text: "cool",
          user: { displayName: "display-name-mockId1", id: "mockId1" }
        }
      ]);
    });
  });

  describe("broadcast", () => {
    it("should send payload on topic to all players", () => {
      const game = createGame();
      game.addPlayer("player1");
      game.addPlayer("player2");

      game.broadcast("hello-topic", "payload");
      expect(socketManager.emitToUsers).toHaveBeenCalledWith(
        ["player1", "player2"],
        "hello-topic",
        "payload"
      );
    });
  });

  describe("events on connected socket", () => {
    test("chat-text event received should triger a broadcast of chat-message", () => {
      const game = createGame();
      const spy = jest.spyOn(game, "broadcast");

      const socket1 = makeEmitter("mockId1");
      game.connect(socket1);

      socket1.emit("chat-text", "hello");

      expect(spy).toHaveBeenCalledWith("chat-message", {
        date: 86400000,
        text: "hello",
        user: { displayName: "display-name-mockId1", id: "mockId1" }
      });
    });

    test("chat-text event received should be stored in message history", () => {
      const game = createGame();

      const socket1 = makeEmitter("mockId1");
      game.connect(socket1);

      socket1.emit("chat-text", "hello");
      socket1.emit("chat-text", "world");
      socket1.emit("chat-text", "cool");

      expect(game.messages).toEqual([
        {
          date: 86400000,
          text: "hello",
          user: { displayName: "display-name-mockId1", id: "mockId1" }
        },
        {
          date: 86400000,
          text: "world",
          user: { displayName: "display-name-mockId1", id: "mockId1" }
        },
        {
          date: 86400000,
          text: "cool",
          user: { displayName: "display-name-mockId1", id: "mockId1" }
        }
      ]);
    });

    test("quit-game-request event received should remove player", () => {
      const game = createGame();

      const socket1 = makeEmitter("mockId1");
      const socket2 = makeEmitter("mockId2");
      game.connect(socket1);
      game.connect(socket2);

      socket1.emit("quit-game-request");
      expect(game.players.get("mockId1")).toEqual(undefined);
      expect(game.players.get("mockId2")).not.toEqual(undefined);
    });
  });

  describe("getPlayerGameDatas", () => {
    it("should return the right value", () => {
      const game = createGame();

      const socket1 = makeEmitter("mockId1");
      const socket2 = makeEmitter("mockId2");
      game.connect(socket1);
      game.connect(socket2);
      const result = game.getPlayerGameDatas();
      expect(result).toEqual([
        {
          gameData: { online: true, score: 0 },
          profile: { displayName: "display-name-mockId1", id: "mockId1" }
        },
        {
          gameData: { online: true, score: 0 },
          profile: { displayName: "display-name-mockId2", id: "mockId2" }
        }
      ]);
    });
  });

  describe("events by socket manager", () => {
    test("add-user event should pass player online if he is in the game ", () => {
      const game = createGame();
      game.players.set("mockId", { score: 1, online: false });
      socketManager.emitter.emit("add-user", "mockId");
      expect(game.players.get("mockId")?.online).toEqual(true);
      game.players = new Map();
      socketManager.emitter.emit("add-user", "mockId");
      expect(game.players.get("mockId")?.online).toEqual(undefined);
    });

    test("remove-user event should pass player offline if he is in the game ", () => {
      const game = createGame();
      game.players.set("mockId", { score: 1, online: true });
      socketManager.emitter.emit("remove-user", "mockId");
      expect(game.players.get("mockId")?.online).toEqual(false);
      game.players = new Map();
      socketManager.emitter.emit("remove-user", "mockId");
      expect(game.players.get("mockId")?.online).toEqual(undefined);
    });
  });
});
