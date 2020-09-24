import React, { FunctionComponent } from "react";
import { useForm } from "react-hook-form";
import { Button } from "react-bootstrap";
import { GameDataUI } from "../../common/interfaces";
import {
  gameHasStarted,
  isSmallBlind,
  isBigBlind,
  getLastBlind
} from "../../back/game/game-engine/actionHandlers";
import styled from "@emotion/styled";

type ControlProps = {
  gameData: GameDataUI;
  myId;
  onBet;
  onDeal;
};

const StyledButton = styled(Button)({ width: 100, margin: 5 });

export const Controls: FunctionComponent<ControlProps> = ({
  gameData,
  myId,
  onBet,
  onDeal
}) => {
  const { handleSubmit, register, errors } = useForm();
  const onSubmit = values => console.log(values);

  const disabled = true;

  const {
    smallBlind,
    bigBlind,
    deal,
    fold,
    raise,
    call,
    allIn,
    check
  } = makeControlStatus(gameData, myId);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ display: "flex", justifyContent: "center", margin: 30 }}
    >
      <StyledButton disabled={!deal} variant="secondary" onClick={onDeal}>
        deal
      </StyledButton>
      <StyledButton disabled={!smallBlind} variant="secondary">
        small blind
      </StyledButton>
      <StyledButton disabled={!bigBlind} variant="secondary">
        big blind
      </StyledButton>
      <StyledButton disabled={!fold} variant="secondary">
        fold
      </StyledButton>
      <StyledButton disabled={!check}>check</StyledButton>
      <StyledButton disabled={!raise} variant="danger">
        raise
      </StyledButton>
      <input
        disabled={!raise}
        type="number"
        id="raise"
        name="raise"
        min={raise?.min}
        max={raise?.max}
      />
    </form>
  );
};

export interface ControlStatus {
  smallBlind?: boolean;
  bigBlind?: boolean;
  fold?: boolean;
  check?: boolean;
  raise?: { min: number; max: number };
  call?: boolean;
  deal?: boolean;
  allIn?: boolean;
}
export const makeControlStatus = (
  gameData: GameDataUI,
  myUserId: string
): ControlStatus => {
  const myIndex = gameData.users.findIndex(u => u.userId === myUserId);

  const result: ControlStatus = {};

  if (myIndex !== gameData.turn || gameData.users.length < 2) {
    return result;
  }

  if (!gameHasStarted(gameData)) {
    return { deal: true };
  }

  if (isSmallBlind(gameData)) {
    return { smallBlind: true };
  }

  if (isBigBlind(gameData)) {
    return { bigBlind: true };
  }

  const myUser = gameData.users[myIndex]!;
  const lastBlind = getLastBlind(gameData.users, gameData.turn)!;

  if (myUser.tokens <= lastBlind) {
    return {
      allIn: true,
      fold: true
    };
  }

  const max = myUser.tokens;
  const min = lastBlind;

  if (lastBlind !== 0 && myUser.tokens > lastBlind) {
    return {
      call: true,
      raise: { min, max },
      fold: true,
      allIn: true
    };
  }

  if (lastBlind === 0) {
    return {
      call: true,
      raise: { min, max },
      fold: true,
      allIn: true,
      check: true
    };
  }
  return {};
};
