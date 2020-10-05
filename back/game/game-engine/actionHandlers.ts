import { SMALL_BLIND } from "./config";
import { newDeck } from "./deck-service/deckService";
import {
  gameIsOver,
  gameStarted,
  isBigBlind,
  isSmallBlind
} from "./gameMethods";
import { FullFlop, GameDataCore, UserGameData } from "./models";
import { getWinnerIdexes } from "./solver";

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

  const newStartTurn =
    gameData.startTurn === null
      ? 0
      : cycleNext(gameData.startTurn, gameData.users.length);

  return {
    ...gameData,
    users: newUsers,
    startTurn: newStartTurn,
    turn: newStartTurn,
    flop: null,
    deck: newDeck()
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
    return gameData;
  }
  const newuser: UserGameData = {
    bet: null,
    hand: null,
    tokens: 1000,
    userId
  };

  return {
    ...gameData,
    users: [...gameData.users, newuser],
    turn: gameData.turn === null ? 0 : gameData.turn
  };
};

export const handleRemovePlayer = (
  gameData: GameDataCore,
  userId
): GameDataCore => {
  if (gameStarted(gameData)) {
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

  if (allButOneFolded(users)) {
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

  return {
    ...gameData,
    flop: newFlop,
    pot: gameData.pot + potTotal,
    deck: newDeck,
    users: resetBlinds(users),
    turn: gameData.startTurn! + 1
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

  if (allButOneFolded(gameData.users)) {
    const newUsers: UserGameData[] = [];
    gameData.users.forEach((user, i) => {
      if (user.bet !== "fold") {
        newUsers.push({ ...user, tokens: user.tokens + gameData.pot });
        return;
      }
      newUsers.push(user);
    });
    return {
      ...gameData,
      users: newUsers,
      pot: 0
    };
  }

  const winners = getWinnerIdexes(
    gameData.users,
    gameData.flop as FullFlop
  ).map(e => e.winnerIndex);

  const prize = gameData.pot / winners.length;
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
    pot: 0
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
    const prevBlind = getLastBlind(users, turn!);

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

export const getLastBlind = (users: UserGameData[], currentTurn: number) => {
  const turn = getLastTurnNotFoldAndNotAllIn(users, currentTurn);

  return users[turn].bet as number | null;
};

const getLastTurnNotFoldAndNotAllIn = (
  users: UserGameData[],
  currentTurn: number
) => {
  let turn = currentTurn;

  while (true) {
    const prevTurn = cyclePrev(turn, users.length);
    const prevUser = users[prevTurn];

    if (prevUser.bet !== "fold" && !isAllIn(prevUser)) {
      return prevTurn;
    }

    turn = prevTurn;
  }
};

const cyclePrev = (current: number, total: number) => {
  if (current === 0) {
    return total - 1;
  }
  return current - 1;
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

export const allButOneFolded = (users: UserGameData[]) => {
  return (
    users.length >= 2 &&
    users.filter(u => u.bet === "fold").length === users.length - 1
  );
};
export const newGame = (): GameDataCore => {
  return {
    users: [],
    turn: null,
    startTurn: null,
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
