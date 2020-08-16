import shortid from "shortid";
import { Socket } from "socket.io";
import { userSocketMock } from "../_fixtures";
import { Game } from "./Game";
import { GameManager } from "./GameManager";

jest.mock("shortid");

beforeAll(() => {
  (shortid.generate as jest.Mock).mockReturnValue("mockGameId");
});

describe("GameManager", () => {
  it("should intialize with empty active games map", () => {
    expect(new GameManager().activeGames).toEqual(new Map());
  });

  describe("create", () => {
    it("should create a game owned by its createor and add it to active games", () => {
      const gameManager = new GameManager();
      gameManager.create("user");

      expect(gameManager.activeGames).toEqual(
        new Map([["mockGameId", new Game("user")]])
      );
    });
  });

  describe("connect", () => {
    it("should throw and error if game doesn't exist", () => {
      const gameManager = new GameManager();
      expect(() =>
        gameManager.connect("nonExistentId", {} as Socket)
      ).toThrowError("Game with id:nonExistentId doesn't exist.");
    });

    it("connect to the requested game with the provided socket", () => {
      const gameManager = new GameManager();
      gameManager.create("creatorId");
      const createdGame = gameManager.activeGames.get("mockGameId");
      const spy = spyOn(createdGame, "connect" as never);
      gameManager.connect("mockGameId", userSocketMock);
      expect(spy).toHaveBeenCalledWith(userSocketMock);
    });
  });
});
