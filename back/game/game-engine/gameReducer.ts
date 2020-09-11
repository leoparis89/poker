import { flow } from "lodash";
import { Move, UserGameData, GameData } from "./models";

const SMALL_BLIND = 10;

export const gameReducer = (gameData: GameData, { userId, blind }: Move) =>
  flow(
    checkGameIsNotOver,
    checkLegalTurn(userId),
    handleBlind(blind),
    handleTurn,
    handleFlop
  )(gameData);

const handleFlop = (gameData: GameData): GameData => {
  const users = gameData.users;
  if (playsersAreEven(users)) {
    const potAddition = users.reduce((pot, user) => {
      return pot + (typeof user.blind === "number" ? user.blind : 0);
    }, 0);

    if (gameData.flop) {
      const newFLop = [...gameData.flop, 4];
      return {
        ...gameData,
        flop: newFLop as any,
        pot: gameData.pot + potAddition,
        users: resetBlinds(users)
      };
    }

    return {
      ...gameData,
      flop: [4, 4, 4],
      pot: potAddition,

      users: resetBlinds(users)
    };
  }
  return gameData;
};

export const handleBlind = (blind?: number | "fold") => (
  gameData: GameData
) => {
  if (blind === "fold") {
    const updatedUser = applyFold(gameData);
    return integrateUser(gameData, updatedUser);
  }

  const actualBlind = getBlind(gameData, blind);
  const updatedUser = applyBlind(gameData, actualBlind);
  return integrateUser(gameData, updatedUser);
};

export const handleTurn = (gameData: GameData): GameData => {
  /**
   * Cycle turns while ignoring folds
   */
  const users = gameData.users;
  let nextTurn = cycleNext(gameData.turn, users.length);

  while (users[nextTurn].blind === "fold") {
    nextTurn = cycleNext(nextTurn, users.length);
  }

  return { ...gameData, turn: nextTurn };
};

const getBlind = (gameData: GameData, blind?: number) => {
  if (isBigOrSmallBlind(gameData)) {
    return (isSmallBlind(gameData) ? 1 : 2) * SMALL_BLIND;
  }
  if (typeof blind !== "number") {
    throw new Error("Blind required");
  }
  return blind;
};

const integrateUser = (gameData: GameData, user: UserGameData): GameData => {
  const newUsers = [...gameData.users];
  newUsers[gameData.turn] = user;
  return { ...gameData, users: newUsers };
};

const applyBlind = (gameData: GameData, blind: number) => {
  const { users, turn } = gameData;
  const currentUser = users[turn];

  if (currentUser.blind === "fold") {
    throw "Can't apply blind to user that folded";
  }

  const currentBlind = currentUser.blind || 0;

  const allIn = currentUser.tokens <= blind;

  if (!allIn) {
    const prevBlind = getLastBlind(users, turn);

    if (prevBlind && prevBlind > blind + currentBlind) {
      throw new Error(
        `Amount ${blind} is insufficient. Minimum should be ${
          prevBlind - currentBlind
        }.`
      );
    }
  }

  const finalBlind = (allIn ? currentUser.tokens : blind) + currentBlind;
  // const finalBlind = Math.max(currentUser.tokens - blind, 0);

  const updatedUser: UserGameData = {
    ...currentUser,
    blind: finalBlind,
    tokens: currentUser.tokens - blind
  };
  return updatedUser;
};

const applyFold = (gameData: GameData) => {
  const { users, turn } = gameData;
  const currentUser = users[turn];

  const updatedUser: UserGameData = {
    ...currentUser,
    blind: "fold"
  };
  return updatedUser;
};

export const getLastBlind = (users: UserGameData[], currentTurn: number) => {
  const turn = getLastTurnNotFoldAndNotAllIn(users, currentTurn);

  return users[turn].blind as number | null;
};

const getLastTurnNotFoldAndNotAllIn = (
  users: UserGameData[],
  currentTurn: number
) => {
  let turn = currentTurn;

  while (true) {
    const prevTurn = getPrevTurn(turn, users.length);
    const prevUser = users[prevTurn];

    if (prevUser.blind !== "fold" && !isAllIn(prevUser)) {
      return prevTurn;
    }

    turn = prevTurn;
  }
};

const getPrevTurn = (current: number, total: number) => {
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
  if (!everybodyPosted(users)) {
    return false;
  }

  const usersInGame = users.filter(u => u.blind !== "fold");

  const highestBlind = Math.max(
    ...(usersInGame.map(u => u.blind) as number[]) // TODO refine typing here
  );

  for (const user of usersInGame) {
    if (!isAllIn(user) && user.blind !== highestBlind) {
      return false;
    }
  }

  return true;
};

const resetBlinds = (users: UserGameData[]) =>
  users.reduce((acc, user) => {
    const blind = user.blind === "fold" ? user.blind : null;

    return [...acc, { ...user, blind }];
  }, [] as UserGameData[]);

const everybodyPosted = (users: UserGameData[]) =>
  users.every(u => u.blind !== null);

const isAllIn = (user: UserGameData) => user.tokens === 0;

const isPreflop = (gameData: GameData) => {
  return gameData.flop === null;
};
const isSmallBlind = (gameData: GameData) =>
  isPreflop(gameData) && gameData.users.every(d => d.blind === null);

const isBigBlind = (gameData: GameData) =>
  isPreflop(gameData) &&
  gameData.users.filter(d => d.blind !== null).length === 1;

const isBigOrSmallBlind = (gameData: GameData) =>
  isSmallBlind(gameData) || isBigBlind(gameData);

export const makeNewGame = (creatorId: string, userIds: string[]): GameData => {
  const creatorIndex = userIds.indexOf(creatorId);

  const usersData = userIds.reduce((acc, userId) => {
    const userData: UserGameData = {
      blind: null,
      hand: [4, 4],
      tokens: 1000,
      userId
    };
    return [...acc, userData];
  }, [] as UserGameData[]);

  return {
    users: usersData,
    turn: creatorIndex,
    flop: null,
    pot: 0
  };
};

const checkGameIsNotOver = (gameData: GameData) => {
  if (gameData.flop?.length === 5) {
    throw new Error("Game is finished. No more turns allowed.");
  }
  return gameData;
};

const checkLegalTurn = userId => (gameData: GameData) => {
  const { users: usersData, ...globalData } = gameData;
  const actualUserIndex = usersData.findIndex(d => d.userId === userId);

  if (globalData.turn !== actualUserIndex) {
    const expectedUser = usersData[globalData.turn];
    throw new Error(
      `User "${userId}" of index ${actualUserIndex} is not allowed to play on this turn.` +
        `\nExpecting "${expectedUser.userId}" of index ${globalData.turn} to play.`
    );
  }
  return gameData;
};
