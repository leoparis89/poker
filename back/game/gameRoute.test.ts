import { Response } from "express";
import MockExpressResponse from "mock-express-response";
import { handleNewGame } from "./gameRoute";
import { gameManager } from "./game-manager/gameManager";
import { Game } from "./game/Game";
import { newDeck } from "./game-engine/deck-service/deckService";
import { mockDeck } from "../_fixtures";

jest.mock("./game-engine/deck-service/deckService");
jest.mock("shortid", () => ({ generate: () => "mockGameId" }));

beforeAll(() => {
  (newDeck as jest.Mock).mockReturnValue(mockDeck);
});

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
