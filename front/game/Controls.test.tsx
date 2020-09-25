import { fireEvent, render, screen, act } from "@testing-library/react";
import { cloneDeep } from "lodash";
import React from "react";
import { newGame } from "../../back/game/game-engine/actionHandlers";
import { gameReducer } from "../../back/game/game-engine/gameReducer.";
import {
  Action,
  GameDataCore,
  UserGameData
} from "../../back/game/game-engine/models";
import { GameDataUI } from "../../common/interfaces";
import { Controls } from "./Controls";

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

describe("<Controls/>", () => {
  let game = newGame();
  const addUsers = [
    { type: "add-player", payload: "foo" },
    { type: "add-player", payload: "bar" },
    { type: "add-player", payload: "baz" },
    { type: "add-player", payload: "kuk" }
  ] as Action[];

  game = addUsers.reduce(gameReducer, game);

  test("all controls should be disabled if it's not players turn", () => {
    // expect(makeControlStatus(toGameDataUI(game), "baz")).toEqual({});
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

  test("first user sees small blind button should call onBet function", () => {
    game = gameReducer(game, { type: "deal" });

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

  test("secons user sees  big blind button and it should call onBet function", () => {
    game = gameReducer(game, { type: "bet", payload: { userId: "foo" } });

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

  test("third user sees raise / call / fold / all in buttons", () => {
    game = gameReducer(game, { type: "bet", payload: { userId: "bar" } });

    const spy = jest.fn();
    render(
      <Controls
        onDeal={jest.fn()}
        onBet={spy}
        myId="baz"
        gameData={toGameDataUI(game)}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /call/i }));
    expect(spy).toHaveBeenCalledWith(20);
    fireEvent.click(screen.getByRole("button", { name: /fold/i }));
    expect(spy).toHaveBeenCalledWith("fold");
    fireEvent.click(screen.getByRole("button", { name: /all in/i }));
    expect(spy).toHaveBeenCalledWith(1000);

    const raiseNode = screen.getByRole("spinbutton", { name: /raise/i });
    fireEvent.change(raiseNode, { target: { value: "44" } });
    // TODO finish test
    const raiseBtn = screen.getByRole("button", { name: /raise/i });
  });

  it("should diplay only all in / fold buttons if user doesnt have enough funds", () => {
    const clonedGame = cloneDeep(game);
    (clonedGame.users[2] as any).tokens = 5;
    const spy = jest.fn();
    render(
      <Controls
        onDeal={jest.fn()}
        onBet={spy}
        myId="baz"
        gameData={toGameDataUI(clonedGame)}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /all in/i }));
    expect(spy).toHaveBeenCalledWith(5);
    fireEvent.click(screen.getByRole("button", { name: /fold/i }));
    expect(spy).toHaveBeenCalledWith("fold");
    expect(screen.queryByRole("button", { name: /call/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /raise/i })).toBeNull();
  });

  it("should display check / all in / raise buttons", () => {
    const gameWithCheck = cloneDeep(game);
    (gameWithCheck.users[1] as any).bet = 0;

    const spy = jest.fn();
    render(
      <Controls
        onDeal={jest.fn()}
        onBet={spy}
        myId="baz"
        gameData={toGameDataUI(gameWithCheck)}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /check/i }));
    expect(spy).toHaveBeenCalledWith(0);
    fireEvent.click(screen.getByRole("button", { name: /all in/i }));
    expect(spy).toHaveBeenCalledWith(1000);
    screen.getByRole("button", { name: /raise/i });
  });
});
