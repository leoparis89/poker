import { Button, styled } from "@material-ui/core";
import React, { FunctionComponent, useState } from "react";
import { useForm } from "react-hook-form";

import { getLastBet } from "../../back/game/game-engine/actionHandlers";
import { SMALL_BLIND } from "../../back/game/game-engine/config";
import {
  gameStarted,
  isBigBlind,
  isSmallBlind,
  gameIsOver,
} from "../../back/game/game-engine/gameMethods";
import { GameDataUI } from "../../common/models";

export type ControlProps = {
  gameData: GameDataUI;
  myId: string;
  onBet: (a: number | "fold") => any;
  onDeal: () => any;
};

const Btn = styled(Button)({ width: 150, margin: 5 });

const StyledButton: typeof Btn = (props) => (
  <Btn color="primary" variant="contained" {...props} />
);

export const Controls: FunctionComponent<ControlProps> = ({
  gameData,
  myId,
  onBet,
  onDeal,
}) => {
  const myIndex = gameData.users.findIndex((u) => u.userId === myId);

  if (myIndex !== gameData.turn || gameData.users.length < 2) {
    return null;
  }

  if (!gameStarted(gameData) || gameIsOver(gameData)) {
    return <StyledButton onClick={onDeal}>deal</StyledButton>;
  }

  const myMyUserProfile = gameData.users.find((u) => u.userId === myId);
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
      <StyledButton onClick={handleBlind({ big: false })}>
        small blind
      </StyledButton>
    );
  }

  if (isBigBlind(gameData)) {
    return (
      <StyledButton onClick={handleBlind({ big: true })}>
        big blind
      </StyledButton>
    );
  }

  const handleAllIn = () => onBet(myTokens);
  const handleFold = () => onBet("fold");
  const foldButton = <StyledButton onClick={handleFold}>fold</StyledButton>;
  const allInButton = <StyledButton onClick={handleAllIn}>all in</StyledButton>;

  const lastBlind = getLastBet(gameData.users, gameData.turn)!;

  if (myTokens <= lastBlind) {
    return (
      <>
        {foldButton}
        {allInButton}
      </>
    );
  }

  const handleCheck = () => onBet(0);

  const handleCall = () =>
    onBet(myBet === null ? lastBlind : lastBlind - myBet);

  const handleRaise = (raise) => {
    const diff = lastBlind - (myBet === null ? 0 : myBet);
    const val = diff + raise;
    onBet(val);
  };

  const checkBtn = <StyledButton onClick={handleCheck}>check</StyledButton>;

  if (myTokens === 0) {
    return <>{checkBtn}</>;
  }

  const canCheck = lastBlind === 0;

  return (
    <>
      {foldButton}
      {canCheck ? (
        checkBtn
      ) : (
        <StyledButton onClick={handleCall}>call</StyledButton>
      )}
      <RaiseBtn myTokens={myTokens} onRaise={handleRaise}></RaiseBtn>
      {allInButton}
    </>
  );
};

export const RaiseBtn = ({ myTokens, onRaise }) => {
  const form = useForm();
  const [raise, setRaise] = useState(0);
  const { handleSubmit, register, errors, formState } = form;
  const onSubmit = (val) => {
    onRaise(Number(val.raise));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <StyledButton
        type="submit"
        variant="contained"
        disabled={!formState.dirty}
      >
        raise {raise}
      </StyledButton>
      <input
        value={raise}
        onChange={(e) => {
          setRaise(Number(e.target.value));
        }}
        ref={register({ required: true })}
        type="range"
        step={5}
        id="raise"
        name="raise"
        min={0}
        max={myTokens}
      />
    </form>
  );
};

const ControlsWrapper = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: 100,
});
export const WrapperdControls = (props) => (
  <ControlsWrapper>
    <Controls {...props} />
  </ControlsWrapper>
);
