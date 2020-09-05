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
    it("should send connected users to newly connected socket", () => {
      const game = createGame();
      const socket1 = makeSocket("mockId1");
      const socket2 = makeSocket("mockId2");
      game.connect(socket1);
      expect(socket1.emit).toHaveBeenCalledWith("connected-users", [
        { displayName: "display-name-mockId1", id: "mockId1" }
      ]);
      game.connect(socket2);
      expect(socket2.emit).toHaveBeenCalledWith("connected-users", [
        { displayName: "display-name-mockId1", id: "mockId1" },
        { displayName: "display-name-mockId2", id: "mockId2" }
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

  describe("getConnectedUsers", () => {
    it("should return user profiles", () => {
      const game = createGame();
      game.players = new Map([
        ["player1", { score: 1 }],
        ["player2", { score: 3 }]
      ]);
      const result = game.getConnectedUsers();
      expect(result).toEqual([
        { displayName: "display-name-player1", id: "player1" },
        { displayName: "display-name-player2", id: "player2" }
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
    test("quit-game event received should remove player", () => {
      const game = createGame();

      const socket1 = makeEmitter("mockId1");
      const socket2 = makeEmitter("mockId2");
      game.connect(socket1);
      game.connect(socket2);

      socket1.emit("quit-game");
      expect(game.players.get("mockId1")).toEqual(undefined);
      expect(game.players.get("mockId2")).not.toEqual(undefined);
    });
  });
});
