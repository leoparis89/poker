import { RequestHandler, Router } from "express";
import { gameManager } from "./game-manager/gameManager";
export const router = Router();

export const handleNewGame: RequestHandler = (req, res) => {
  const newGame = gameManager.create((req.user as any).id);
  const { id, creatorId } = newGame;
  res.json({ id, creatorId });
};

router.post("/new", handleNewGame);
