import { Response } from "express";
import MockExpressResponse from "mock-express-response";
import { handleNewGame } from "./gameRoute";
import { gameManager } from "./GameManager";
import { Game } from "./Game";

jest.mock("shortid", () => ({ generate: () => "mockGameId" }));

describe("handleNewGame", () => {
  it("should create a new game and add it to active games", async () => {
    const res = new MockExpressResponse();
    handleNewGame(
      { user: { id: "mockUserId" } } as any,
      res as Response,
      jest.fn()
    );

    const addedGame = gameManager.activeGames.get("mockGameId");
    const expected = new Game("mockUserId");

    expect(JSON.stringify(addedGame)).toEqual(JSON.stringify(expected));
  });
});
