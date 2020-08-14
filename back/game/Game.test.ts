import shortid from "shortid";
import { usersDb } from "../db/users";
import { UserSocket } from "../interfaces";
import { profileMock1, profileMock2, userSocketMock } from "../_fixtures";
import { Game } from "./Game";

jest.mock("shortId");
jest.mock("../db/users");

beforeAll(() => {
  (shortid.generate as jest.Mock).mockReturnValue("id");
});

const createGame = () => new Game("creatorId");

describe("Game", () => {
  it("should initialize with an id", () => {
    const game = createGame();
    expect(game.id).toEqual("id");
  });

  describe("connect", () => {
    it("should add an entry for user in sockets map if it doesn't already exist", () => {
      const game = createGame();
      game.connect(userSocketMock);
      expect(game.sockets.get("mockId")).toEqual([userSocketMock]);
    });

    it("should add socket to existing entry if it exists", () => {
      const game = createGame();
      game.connect(userSocketMock);
      game.connect(userSocketMock);
      expect(game.sockets.get("mockId")).toEqual([
        userSocketMock,
        userSocketMock
      ]);
    });

    it("should broadcast connected users if a new socket connects", () => {
      (usersDb.get as jest.Mock)
        .mockReturnValueOnce(profileMock1)
        .mockReturnValueOnce(profileMock1)
        .mockReturnValueOnce(profileMock2);
      const game = createGame();

      const socket1 = {
        ...userSocketMock,
        ...{
          request: { user: { id: "mockId1" } }
        }
      } as UserSocket;

      const socket2 = {
        ...userSocketMock,
        ...{
          request: { user: { id: "mockId2" } }
        }
      } as UserSocket;

      const socket3 = {
        ...userSocketMock,
        ...{
          request: { user: { id: "mockId2" } }
        }
      } as UserSocket;
      game.connect(socket1);
      expect(socket1.emit).toHaveBeenCalledWith("connected-users", [
        profileMock1
      ]);

      game.connect(socket2);
      expect(socket1.emit).toHaveBeenCalledWith("connected-users", [
        profileMock1,
        profileMock2
      ]);

      game.connect(socket3);
      expect(socket1.emit).toHaveBeenCalledWith("connected-users", [
        profileMock1,
        profileMock2
      ]);
      expect(socket2.emit).toHaveBeenCalledWith("connected-users", [
        profileMock1,
        profileMock2
      ]);
      expect(socket3.emit).toHaveBeenCalledWith("connected-users", [
        profileMock1,
        profileMock2
      ]);
    });
  });

  describe("broadcast", () => {
    it("should emit provided payload on provided topic to all connected sockets", () => {
      const game = createGame();
      const socket1 = { ...userSocketMock };
      const socket2 = { ...userSocketMock };
      const socket3 = { ...userSocketMock };
      game.connect(socket1);
      game.connect(socket2);
      game.connect(socket3);
      game.broadcast("mockTopic", { mock: "payload" });
      expect(socket1.emit).toHaveBeenCalledWith("mockTopic", {
        mock: "payload"
      });
      expect(socket2.emit).toHaveBeenCalledWith("mockTopic", {
        mock: "payload"
      });
      expect(socket3.emit).toHaveBeenCalledWith("mockTopic", {
        mock: "payload"
      });
    });
  });

  describe("emitConnectedUserProfiles", () => {
    it("should broadcast the list of connected users", () => {
      (usersDb.get as jest.Mock)
        .mockReturnValueOnce(profileMock1)
        .mockReturnValueOnce(profileMock2);

      const game = createGame();

      const socket1 = {
        ...userSocketMock,
        ...{
          request: { user: { id: "mockId1" } }
        }
      } as UserSocket;

      const socket2 = {
        ...userSocketMock,
        ...{
          request: { user: { id: "mockId2" } }
        }
      } as UserSocket;

      const socket3 = {
        ...userSocketMock,
        ...{
          request: { user: { id: "mockId2" } }
        }
      } as UserSocket;

      game.sockets.set("mockId1", [socket1]);
      game.sockets.set("mockId2", [socket2, socket3]);
      game.broadcastConnectedUsers();

      expect(socket1.emit).toHaveBeenCalledWith("connected-users", [
        profileMock1,
        profileMock2
      ]);
    });
  });

  describe("disconnect", () => {
    it("should remove the socket from game", () => {
      const game = createGame();

      const socket1 = {
        ...userSocketMock,
        ...{
          request: { user: { id: "mockId1" } }
        },
        id: "foo"
      } as UserSocket;

      const socket2 = {
        ...userSocketMock,
        ...{
          request: { user: { id: "mockId1" } }
        }
      } as UserSocket;

      game.sockets.set("mockId1", [socket1, socket2]);
      game.disconnect(socket1);
      expect(game.sockets.get("mockId1")!.length).toEqual(1);
    });

    it("should remove user entry from sockets id user has no sockets", () => {
      const game = createGame();

      const socket1 = {
        ...userSocketMock,
        ...{
          request: { user: { id: "mockId1" } }
        },
        id: "foo"
      } as UserSocket;

      const socket2 = {
        ...userSocketMock,
        ...{
          request: { user: { id: "mockId1" } }
        }
      } as UserSocket;

      game.sockets.set("mockId1", [socket1, socket2]);
      game.disconnect(socket1);
      game.disconnect(socket2);
      expect(game.sockets.get("mockId1")).toEqual(undefined);
    });

    it("should trow an error if socket doesn't exist in game", () => {});
    (usersDb.get as jest.Mock)
      .mockReturnValueOnce(profileMock1)
      .mockReturnValueOnce(profileMock2);

    const game = createGame();

    const socket1 = {
      ...userSocketMock,
      ...{
        request: { user: { id: "mockId1" } }
      }
    } as UserSocket;

    const socket2 = {
      ...userSocketMock,
      ...{
        request: { user: { id: "mockId2" } }
      }
    } as UserSocket;

    game.sockets.set("mockId1", [socket1]);

    expect(() => game.disconnect(socket2)).toThrowError(
      "No socket with id mockId2 found in game."
    );
  });
});
