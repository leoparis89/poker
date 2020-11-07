import { SMALL_BLIND } from "./config";
import { newDeck } from "./deck-service/deckService";
import {
  gameIsOver,
  gameStarted,
  isBigBlind,
  isSmallBlind
} from "./gameMethods";
import { FullFlop, GameDataCore, UserGameData } from "./models";
import {
  getWinnerIndos as getWinnerInfos,
  WinnerInfo,
  WinnerInfoWithAmount
} from "./solver";

/**
 * Resets deck, hands, and user bets (could be folded).
 * In crements start turn and sets it at current turn.
 * @param gameData
 */
export const handleReset = (gameData: GameDataCore): GameDataCore => {
  const newUsers: UserGameData[] = [];
  for (const user of gameData.users) {
    newUsers.push({ ...user, bet: null, hand: null });
  }

  return {
    ...gameData,
    users: newUsers,
    flop: null,
    deck: newDeck(),
    winners: undefined
  };
};

/**
 * Deals hands
 * @param gameData
 */
export const handleDeal = (gameData: GameDataCore): GameDataCore => {
  const newDeck = [...gameData.deck];
  const newUsers: UserGameData[] = [];
  for (const user of gameData.users) {
    const newUser = { ...user, hand: newDeck.splice(0, 2) as any };
    newUsers.push(newUser);
  }
  return { ...gameData, deck: newDeck, users: newUsers };
};

export const handleAddPlayer = (
  gameData: GameDataCore,
  userId
): GameDataCore => {
  if (gameStarted(gameData)) {
    throw new Error("Can't add players when game started.");
  }
  const newuser: UserGameData = {
    bet: null,
    hand: null,
    tokens: 1000,
    userId
  };

  return {
    ...gameData,
    users: [...gameData.users, newuser]
  };
};

export const handleRemovePlayer = (
  gameData: GameDataCore,
  userId
): GameDataCore => {
  if (gameStarted(gameData)) {
    throw new Error("Can't remove players when game started.");
    return gameData;
  }

  const userIndex = gameData.users.indexOf(userId);
  if (!userIndex) {
    throw new Error(
      `Can't remove ${userId} from game because he doesn't exist.`
    );
  }

  const newUsers = [...gameData.users];
  newUsers.splice(userIndex, 1);
  return { ...gameData, users: newUsers };
};

export const handleFlop = (gameData: GameDataCore): GameDataCore => {
  const users = gameData.users;
  if (!playsersAreEven(users)) {
    return gameData;
  }

  const potTotal = users.reduce(
    (pot, user) => pot + (typeof user.bet === "number" ? user.bet : 0),
    0
  );

  if (allFolded(users)) {
    return {
      ...gameData,
      pot: gameData.pot + potTotal,
      users: resetBlinds(users)
    };
  }

  const newDeck = [...gameData.deck];

  const newFlop = gameData.flop
    ? [...gameData.flop, newDeck.shift()]
    : (newDeck.splice(0, 3) as any);

  let resetTurn = gameData.startTurn;
  do {
    resetTurn = cycleNext(resetTurn, gameData.users.length);
  } while (gameData.users[resetTurn].bet === "fold");

  return {
    ...gameData,
    flop: newFlop,
    pot: gameData.pot + potTotal,
    deck: newDeck,
    users: resetBlinds(users),
    turn: resetTurn
  };
};

export const handleBet = (bet?: number | "fold") => (
  gameData: GameDataCore
) => {
  if (bet === "fold") {
    return applyFold(gameData);
  }

  const actualBet = forceBlind(gameData, bet);
  const updatedUser = applyBetOnUser(gameData, actualBet);
  return integrateUser(gameData, updatedUser);
};

/**
 * Increment turn within a cycle while ignoring folds
 */
export const handleTurn = (gameData: GameDataCore): GameDataCore => {
  const users = gameData.users;
  let nextTurn = cycleNext(gameData.turn!, users.length);

  while (users[nextTurn].bet === "fold") {
    nextTurn = cycleNext(nextTurn, users.length);
  }

  return { ...gameData, turn: nextTurn };
};

export const handleGains = (gameData: GameDataCore): GameDataCore => {
  if (!gameIsOver(gameData)) {
    return gameData;
  }

  if (allFolded(gameData.users)) {
    return handleAllFolded(gameData);
  }

  const nextStartTurn = cycleNext(gameData.startTurn, gameData.users.length);
  const winnerInfos = getWinnerInfos(gameData.users, gameData.flop as FullFlop);
  const winners = winnerInfos.map(e => e.winnerIndex);
  const prize = gameData.pot / winners.length;
  const winnerInfoWIthAmount: WinnerInfoWithAmount[] = winnerInfos.map(w => {
    return { ...w, amount: prize };
  });
  const newUsers: UserGameData[] = [];

  gameData.users.forEach((user, i) => {
    if (winners.includes(i)) {
      newUsers.push({ ...user, tokens: user.tokens + prize });
      return;
    }
    newUsers.push(user);
  });
  return {
    ...gameData,
    users: newUsers,
    pot: 0,
    turn: nextStartTurn,
    startTurn: nextStartTurn,
    winners: winnerInfoWIthAmount
  };
};

const handleAllFolded = (gameData: GameDataCore): GameDataCore => {
  const nextStartTurn = cycleNext(gameData.startTurn, gameData.users.length);
  const newUsers: UserGameData[] = [];
  const prize = gameData.pot;
  gameData.users.forEach((user, i) => {
    if (user.bet !== "fold") {
      newUsers.push({ ...user, tokens: user.tokens + gameData.pot });
      return;
    }
    newUsers.push(user);
  });

  const winners: WinnerInfoWithAmount[] = [
    {
      descr: "Everyone folded",
      winnerIndex: gameData.users.findIndex(u => u.bet !== "fold"),
      amount: prize
    }
  ];

  return {
    ...gameData,
    users: newUsers,
    pot: 0,
    turn: nextStartTurn,
    startTurn: nextStartTurn,
    winners
  };
};

const forceBlind = (gameData: GameDataCore, blind?: number) => {
  if (isBigOrSmallBlind(gameData)) {
    return (isSmallBlind(gameData) ? 1 : 2) * SMALL_BLIND;
  }
  if (typeof blind !== "number") {
    throw new Error("Blind required");
  }
  return blind;
};

const integrateUser = (
  gameData: GameDataCore,
  user: UserGameData
): GameDataCore => {
  const newUsers = [...gameData.users];
  newUsers[gameData.turn!] = user;
  return { ...gameData, users: newUsers };
};

const applyBetOnUser = (gameData: GameDataCore, bet: number) => {
  const { users, turn } = gameData;
  const currentUser = users[turn!];

  if (currentUser.bet === "fold") {
    throw "Can't apply blind to user that folded";
  }

  const currentBlind = currentUser.bet || 0;

  const allIn = currentUser.tokens <= bet;

  if (!allIn) {
    const prevBlind = getLastBet(users, turn!);

    if (prevBlind && prevBlind > bet + currentBlind) {
      throw new Error(
        `Amount ${bet} is insufficient. Minimum should be ${
          prevBlind - currentBlind
        }.`
      );
    }
  }

  const finalBlind = (allIn ? currentUser.tokens : bet) + currentBlind;

  const updatedUser: UserGameData = {
    ...currentUser,
    bet: finalBlind,
    tokens: currentUser.tokens - bet
  };
  return updatedUser;
};

const applyFold = (gameData: GameDataCore) => {
  const { users, turn } = gameData;
  const currentUser = users[turn!];

  const newGameData = {
    ...gameData,
    pot: gameData.pot + (currentUser.bet as number)
  };

  const updatedUser: UserGameData = {
    ...currentUser,
    bet: "fold"
  };
  return integrateUser(newGameData, updatedUser);
};

export const getLastBet = (users: UserGameData[], currentTurn: number) => {
  const bets = users.map(user => user.bet).filter(bet => bet !== "fold");
  const biggestBet = Math.max(...(bets as any));
  return biggestBet;
};

const cycleNext = (current: number, total: number) => {
  if (current === total - 1) {
    return 0;
  }
  return current + 1;
};

export const playsersAreEven = (users: UserGameData[]) => {
  if (!everybodyBidded(users)) {
    return false;
  }

  const usersInGame = users.filter(u => u.bet !== "fold");

  const highestBlind = Math.max(
    ...(usersInGame.map(u => u.bet) as number[]) // TODO refine typing here
  );

  for (const user of usersInGame) {
    if (!isAllIn(user) && user.bet !== highestBlind) {
      return false;
    }
  }

  return true;
};

const resetBlinds = (users: UserGameData[]) =>
  users.reduce((acc, user) => {
    const blind = user.bet === "fold" ? user.bet : null;

    return [...acc, { ...user, bet: blind }];
  }, [] as UserGameData[]);

const everybodyBidded = (users: UserGameData[]) =>
  users.every(u => u.bet !== null);

const isAllIn = (user: UserGameData) => user.tokens === 0;

const isBigOrSmallBlind = (gameData: GameDataCore) =>
  isSmallBlind(gameData) || isBigBlind(gameData);

export const allFolded = (users: UserGameData[]) => {
  return (
    users.length >= 2 &&
    users.filter(u => u.bet === "fold").length === users.length - 1
  );
};
export const newGame = (): GameDataCore => {
  return {
    users: [],
    turn: 0,
    startTurn: 0,
    flop: null,
    pot: 0,
    deck: newDeck()
  };
};

export const checkGameIsNotOver = (gameData: GameDataCore) => {
  if (gameIsOver(gameData)) {
    throw new Error("Game is finished. No more turns allowed.");
  }
  return gameData;
};

export const checkEnoughUsers = (gameData: GameDataCore) => {
  if (gameData.users.length < 2) {
    throw new Error("Not enough users in game to play.");
  }
  return gameData;
};

export const checkLegalTurn = userId => (gameData: GameDataCore) => {
  const { users: usersData, ...globalData } = gameData;
  const actualUserIndex = usersData.findIndex(d => d.userId === userId);

  if (globalData.turn !== actualUserIndex) {
    const expectedUser = usersData[globalData.turn!];
    throw new Error(
      `User "${userId}" of index ${actualUserIndex} is not allowed to play on this turn.` +
        `\nExpecting "${expectedUser.userId}" of index ${globalData.turn} to play.`
    );
  }
  return gameData;
};
