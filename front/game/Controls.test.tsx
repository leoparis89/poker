import { cloneDeep } from "lodash";
import { render } from "@testing-library/react";
import React from "react";
import { Controls, makeControlStatus } from "./Controls";
import { GameDataUI, GameStateUI } from "../../common/interfaces";
import { UserDataUI } from "./UserCard";
import {
  UserGameData,
  Action,
  GameDataCore
} from "../../back/game/game-engine/models";
import { newGame } from "../../back/game/game-engine/actionHandlers";
import { gameReducer } from "../../back/game/game-engine/gameReducer.";

const gameDataToGameDataUI = (gameData: GameDataCore): GameDataUI => {
  const { deck, ...data } = gameData;
  return { id: "mockId", creatorId: "mockCreatorId", ...data };
};

const makeUserDataUI = (userId, tokens = 100, bet = null) => {
  return {
    userId,
    bet,
    tokens
  } as UserGameData;
};

describe("<Controls />", () => {
  it("should display players", () => {
    // render(<Controls gameData={{} as GameDataUI} />);
    // act(() => {
    //ch   socketService.socket.emit("game-data", mockGame);
    // });
    // expect(screen.queryAllByText("profile").length).toEqual(3);
  });
});

describe("makeControlStatus", () => {
  let game = newGame();
  const addUsers = [
    { type: "add-player", payload: "foo" },
    { type: "add-player", payload: "bar" },
    { type: "add-player", payload: "baz" },
    { type: "add-player", payload: "kuk" }
  ] as Action[];

  game = addUsers.reduce(gameReducer, game);

  test("all controls should be disabled if it's not players turn", () => {
    expect(makeControlStatus(gameDataToGameDataUI(game), "baz")).toEqual({});
  });

  it("should display deal button", () => {
    expect(makeControlStatus(gameDataToGameDataUI(game), "foo")).toEqual({
      deal: true
    });
  });

  it("should display small blind button", () => {
    game = gameReducer(game, { type: "deal" });
    expect(makeControlStatus(gameDataToGameDataUI(game), "foo")).toEqual({
      smallBlind: true
    });
  });

  it("should display big blind button", () => {
    game = gameReducer(game, { type: "bet", payload: { userId: "foo" } });

    expect(makeControlStatus(gameDataToGameDataUI(game), "bar")).toEqual({
      bigBlind: true
    });
  });

  it("should display call and raise buttons", () => {
    game = gameReducer(game, { type: "bet", payload: { userId: "bar" } });
    expect(makeControlStatus(gameDataToGameDataUI(game), "baz")).toEqual({
      allIn: true,
      call: true,
      raise: { min: 20, max: 1000 },
      fold: true
    });
  });

  it("should diplay onlyAllIn button if user doesnt have enough funds", () => {
    const clonedGame = cloneDeep(game);
    (clonedGame.users[2] as any).tokens = 5;

    expect(makeControlStatus(gameDataToGameDataUI(clonedGame), "baz")).toEqual({
      allIn: true,
      fold: true
    });
  });

  it("should display check button", () => {
    const gameWithCheck = cloneDeep(game);
    (gameWithCheck.users[1] as any).bet = 0;

    expect(
      makeControlStatus(gameDataToGameDataUI(gameWithCheck), "baz")
    ).toEqual({
      allIn: true,
      call: true,
      raise: { min: 0, max: 1000 },
      check: true,
      fold: true
    });
  });
});
