import styled from "@emotion/styled";
import React, { FunctionComponent } from "react";
import { useForm } from "react-hook-form";

import { Button } from "react-bootstrap";
import {
  gameStarted,
  getLastBlind,
  isBigBlind,
  isSmallBlind,
  SMALL_BLIND
} from "../../back/game/game-engine/actionHandlers";
import { GameDataUI } from "../../common/interfaces";

type ControlProps = {
  gameData: GameDataUI;
  myId: string;
  onBet: (a: number | "fold") => any;
  onDeal: () => any;
};

const StyledButton = styled(Button)({ width: 100, margin: 5 });

export const Controls: FunctionComponent<ControlProps> = ({
  gameData,
  myId,
  onBet,
  onDeal
}) => {
  const myIndex = gameData.users.findIndex(u => u.userId === myId);

  if (myIndex !== gameData.turn || gameData.users.length < 2) {
    return <div>No Action</div>;
  }

  if (!gameStarted(gameData)) {
    return (
      <StyledButton variant="secondary" onClick={onDeal}>
        deal
      </StyledButton>
    );
  }

  const myMyUserProfile = gameData.users.find(u => u.userId === myId);
  if (!myMyUserProfile) {
    throw new Error("User not in game !");
  }

  const { tokens: myTokens, bet: myBet } = myMyUserProfile;

  if (myBet === "fold") {
    throw new Error("Folded player cant play!");
  }

  const handleBlind = ({ big }) => () => {
    const amount = (big ? 2 : 1) * SMALL_BLIND;
    onBet(myTokens < amount ? myTokens : amount);
  };

  if (isSmallBlind(gameData)) {
    return (
      <StyledButton onClick={handleBlind({ big: false })} variant="secondary">
        small blind
      </StyledButton>
    );
  }

  if (isBigBlind(gameData)) {
    return (
      <StyledButton onClick={handleBlind({ big: true })} variant="secondary">
        big blind
      </StyledButton>
    );
  }

  const handleAllIn = () => onBet(myTokens);
  const handleFold = () => onBet("fold");
  const foldButton = (
    <StyledButton onClick={handleFold} variant="secondary">
      fold
    </StyledButton>
  );
  const allInButton = (
    <StyledButton onClick={handleAllIn} variant="danger">
      all in
    </StyledButton>
  );
  const lastBlind = getLastBlind(gameData.users, gameData.turn)!;

  if (myTokens <= lastBlind) {
    return (
      <div>
        {foldButton}
        {allInButton}
      </div>
    );
  }

  const handleCheck = () => onBet(0);

  const handleCall = () =>
    onBet(myBet === null ? lastBlind : lastBlind - myBet);

  const handleRaise = raise => {
    const diff = lastBlind - (myBet === null ? 0 : myBet);
    const val = diff + raise;
    onBet(val);
  };

  const canCheck =
    lastBlind === 0 || (lastBlind === null && gameData.flop !== null);

  return (
    <div>
      {foldButton}
      {canCheck ? (
        <StyledButton onClick={handleCheck}>check</StyledButton>
      ) : (
        <StyledButton onClick={handleCall}>call</StyledButton>
      )}
      <RaiseBtn myTokens={myTokens} onRaise={handleRaise}></RaiseBtn>
      {allInButton}
    </div>
  );
};

export const RaiseBtn = ({ myTokens, onRaise }) => {
  const { handleSubmit, register, errors } = useForm();
  const onSubmit = ({ raise }) => {
    onRaise(Number(raise)); //wtf
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as any)}>
      <StyledButton type="submit" variant="warning">
        raise
      </StyledButton>
      <label htmlFor="raise">raise amount</label>
      <input
        ref={register({
          required: "Required"
        })}
        type="number"
        id="raise"
        name="raise"
        min={0}
        max={myTokens}
      />
    </form>
  );
};
