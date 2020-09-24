import React, { FunctionComponent } from "react";
import { useForm } from "react-hook-form";
import { Button } from "react-bootstrap";
import { GameDataUI } from "../../common/interfaces";
import {
  gameStarted,
  isSmallBlind,
  isBigBlind,
  getLastBlind,
  SMALL_BLIND
} from "../../back/game/game-engine/actionHandlers";
import styled from "@emotion/styled";

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

  const { tokens } = gameData.users.find(u => u.userId === myId)!;

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <StyledButton disabled={!deal} variant="secondary" onClick={onDeal}>
        deal
      </StyledButton>
      <StyledButton
        disabled={!smallBlind}
        onClick={() => onBet(tokens < SMALL_BLIND ? tokens : SMALL_BLIND)}
        variant="secondary"
      >
        small blind
      </StyledButton>
      <StyledButton
        disabled={!bigBlind}
        onClick={() =>
          onBet(tokens < 2 * SMALL_BLIND ? tokens : 2 * SMALL_BLIND)
        }
        variant="secondary"
      >
        big blind
      </StyledButton>
      <StyledButton disabled={!fold} variant="secondary">
        fold
      </StyledButton>
      <StyledButton disabled={!check}>check</StyledButton>
      <StyledButton disabled={!call}>call</StyledButton>
      <StyledButton disabled={!raise} variant="warning">
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
      <StyledButton disabled={!allIn} variant="danger">
        all in
      </StyledButton>
    </div>
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

  if (!gameStarted(gameData)) {
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

  if (lastBlind === null && gameData.flop) {
    return {
      raise: { min, max },
      fold: true,
      allIn: true,
      check: true
    };
  }
  return {};
};
