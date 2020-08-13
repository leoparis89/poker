import { Response } from "express";
import MockExpressResponse from "mock-express-response";
import { handleNewGame } from "./gameRoute";

jest.mock("shortid", () => ({ generate: () => "coolId" }));

describe("handleNewGame", () => {
  it("should create a new game and add it to active games", async () => {
    const res = new MockExpressResponse();
    handleNewGame({ user: { id: "bar" } } as any, res as Response, jest.fn());
    // expect(activeGames).toEqual([{ creator: "bar", id: "coolId" }]);
  });
});
