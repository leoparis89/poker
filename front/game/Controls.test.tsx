import { cloneDeep } from "lodash";
import { render, fireEvent, screen } from "@testing-library/react";
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

const toGameDataUI = (gameData: GameDataCore): GameDataUI => {
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

describe("makeControlStatus function and <Controls/> component", () => {
  let game = newGame();
  const addUsers = [
    { type: "add-player", payload: "foo" },
    { type: "add-player", payload: "bar" },
    { type: "add-player", payload: "baz" },
    { type: "add-player", payload: "kuk" }
  ] as Action[];

  game = addUsers.reduce(gameReducer, game);

  test("all controls should be disabled if it's not players turn", () => {
    expect(makeControlStatus(toGameDataUI(game), "baz")).toEqual({});
  });

  it("should display deal button", () => {
    expect(makeControlStatus(toGameDataUI(game), "foo")).toEqual({
      deal: true
    });
  });

  test("clicking deal button should call onDeal ", () => {
    const spy = jest.fn();
    render(
      <Controls
        onDeal={spy}
        onBet={jest.fn()}
        myId="foo"
        gameData={toGameDataUI(game)}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /deal/i }));
    expect(spy).toHaveBeenCalled();
  });

  it("should display small blind button", () => {
    game = gameReducer(game, { type: "deal" });
    expect(makeControlStatus(toGameDataUI(game), "foo")).toEqual({
      smallBlind: true
    });
  });

  test("clicking small blind button should call onBet function", () => {
    const spy = jest.fn();
    render(
      <Controls
        onDeal={jest.fn()}
        onBet={spy}
        myId="foo"
        gameData={toGameDataUI(game)}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /small blind/i }));
    expect(spy).toHaveBeenCalledWith(10);
  });

  it("should display big blind button", () => {
    game = gameReducer(game, { type: "bet", payload: { userId: "foo" } });

    expect(makeControlStatus(toGameDataUI(game), "bar")).toEqual({
      bigBlind: true
    });
  });

  test("clicking big blind button should call onBet function", () => {
    const spy = jest.fn();
    render(
      <Controls
        onDeal={jest.fn()}
        onBet={spy}
        myId="bar"
        gameData={toGameDataUI(game)}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /big blind/i }));
    expect(spy).toHaveBeenCalledWith(20);
  });

  it("should display call and raise buttons", () => {
    game = gameReducer(game, { type: "bet", payload: { userId: "bar" } });
    expect(makeControlStatus(toGameDataUI(game), "baz")).toEqual({
      allIn: true,
      call: true,
      raise: { min: 20, max: 1000 },
      fold: true
    });
  });

  it("should diplay only AllIn button if user doesnt have enough funds", () => {
    const clonedGame = cloneDeep(game);
    (clonedGame.users[2] as any).tokens = 5;

    expect(makeControlStatus(toGameDataUI(clonedGame), "baz")).toEqual({
      allIn: true,
      fold: true
    });
  });

  it("should display check button", () => {
    const gameWithCheck = cloneDeep(game);
    (gameWithCheck.users[1] as any).bet = 0;

    expect(makeControlStatus(toGameDataUI(gameWithCheck), "baz")).toEqual({
      allIn: true,
      call: true,
      raise: { min: 0, max: 1000 },
      check: true,
      fold: true
    });
  });
});
