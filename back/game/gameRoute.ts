import { RequestHandler, Router } from "express";
import { Game } from "./Game";
export const router = Router();

export const handleNewGame: RequestHandler = (req, res) => {
  const game = new Game((req.user as any).id);
  const { id, creatorId: creator } = game;
  // activeGames.set(id, game);
  res.json({ id, creator });
};

router.post("/new", handleNewGame);
