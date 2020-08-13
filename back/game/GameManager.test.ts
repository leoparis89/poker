import { GameManager } from "./GameManager";
import { Socket } from "socket.io";
import { Game } from "./Game";
import shortid from "shortid";

jest.mock("shortId");

beforeAll(() => {
  (shortid.generate as jest.Mock).mockReturnValue("id");
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
        new Map([["id", new Game("user")]])
      );
    });
  });

  describe("join", () => {
    it("should throw and error if game doesn't exist", () => {
      const gameManager = new GameManager();
      expect(() =>
        gameManager.join("nonExistentId", {} as Socket)
      ).toThrowError("Game with id:nonExistentId doesn't exist.");
    });
  });
});
