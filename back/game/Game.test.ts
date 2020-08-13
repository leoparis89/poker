import shortid from "shortid";
import { Game } from "./Game";
import { UserSocket } from "../interfaces";

jest.mock("shortId");

beforeAll(() => {
  (shortid.generate as jest.Mock).mockReturnValue("id");
});

const createGame = () => new Game("creatorId");

const userSocketMock = { request: { user: { id: "mockId" } } } as UserSocket;

describe("Game", () => {
  it("should initialize with an id", () => {
    const game = createGame();
    expect(game.id).toEqual("id");
  });

  describe("connect", () => {
    it("should create endry for user in sockets map if none exists", () => {
      const game = createGame();
      game.connect(userSocketMock);
      expect(game.sockets.get("mockId")).toEqual([userSocketMock]);
    });

    it("should add socket to existing entry", () => {
      const game = createGame();
      game.connect(userSocketMock);
      game.connect(userSocketMock);
      expect(game.sockets.get("mockId")).toEqual([
        userSocketMock,
        userSocketMock
      ]);
    });
  });
});
