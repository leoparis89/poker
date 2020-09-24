import { render, act, screen } from "@testing-library/react";
import React from "react";
import { Game } from "./Game";

import { EventEmitter } from "events";
jest.mock("../socketService");

import { socketService } from "../socketService";
import { GameDataUI, UserSession, GameStateUI } from "../../common/interfaces";
beforeAll(() => {
  (socketService.socket as any) = new EventEmitter();
});

const mockGame: GameDataUI = {
  id: "foo",
  creatorId: "bar",
  flop: null,
  pot: 0,
  startTurn: 0,
  turn: 0,
  users: [
    {
      bet: null,
      hand: null,
      tokens: 1000,
      userId: "foo"
    },
    {
      bet: null,
      hand: null,
      tokens: 1000,
      userId: "bar"
    },
    {
      bet: null,
      hand: null,
      tokens: 1000,
      userId: "baz"
    }
  ]
};

const makeUserSession = (id, offline = false) => {
  return { profile: { id }, online: offline } as UserSession;
};

const players: UserSession[] = ["foo", "bar", "baz"].map(id =>
  makeUserSession(id)
);
const gameState: GameStateUI = {
  players,
  gameData: mockGame
};

describe("<Game/>", () => {
  it("should display players", () => {
    render(<Game user={{ id: "foo" } as any} gameId={"foo"} />);
    act(() => {
      socketService.socket.emit("game-data", gameState);
    });

    expect(screen.queryAllByRole("listitem").length).toEqual(3);
  });
});
