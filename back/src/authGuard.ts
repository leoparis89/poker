import { RequestHandler } from "express";

export const authGuard: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    res.status(401).json("Unauthorized!");
  } else {
    next();
  }
};
