import { Move, UserGameData, GameDataCore, Action, userId } from "./models";
import { newDeck } from "./deckService";
import { GameDataUI } from "../../../common/interfaces";
import { gameReducer } from "./gameReducer.";

export const SMALL_BLIND = 10;

export const handleReset = (gameData: GameDataCore): GameDataCore => {
  const newUsers: any = [];
  for (const user of gameData.users) {
    newUsers.push({ ...user, bet: null, hand: null });
  }
  return {
    ...gameData,
    users: newUsers,
    startTurn: gameData.startTurn! + 1,
    turn: gameData.startTurn! + 1,
    flop: null,
    deck: newDeck()
  };
};

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
    turn: gameData.turn === null ? 0 : gameData.turn,
    startTurn: gameData.startTurn === null ? 0 : gameData.startTurn
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
  const newDeck = [...gameData.deck];
  if (playsersAreEven(users)) {
    const potAddition = users.reduce((pot, user) => {
      return pot + (typeof user.bet === "number" ? user.bet : 0);
    }, 0);

    if (gameData.flop) {
      const newFLop = [...gameData.flop, newDeck.shift()];
      return {
        ...gameData,
        flop: newFLop as any,
        pot: gameData.pot + potAddition,
        users: resetBlinds(users),
        deck: newDeck
      };
    }

    return {
      ...gameData,
      flop: newDeck.splice(0, 3) as any,
      pot: potAddition,
      deck: newDeck,
      users: resetBlinds(users)
    };
  }
  return gameData;
};

export const handleBet = (bet?: number | "fold") => (
  gameData: GameDataCore
) => {
  if (bet === "fold") {
    const updatedUser = applyFold(gameData);
    return integrateUser(gameData, updatedUser);
  }

  const actualBet = forceBlind(gameData, bet);
  const updatedUser = applyBet(gameData, actualBet);
  return integrateUser(gameData, updatedUser);
};

export const handleTurn = (gameData: GameDataCore): GameDataCore => {
  /**
   * Cycle turns while ignoring folds
   */
  const users = gameData.users;
  let nextTurn = cycleNext(gameData.turn!, users.length);

  while (users[nextTurn].bet === "fold") {
    nextTurn = cycleNext(nextTurn, users.length);
  }

  return { ...gameData, turn: nextTurn };
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

const applyBet = (gameData: GameDataCore, bet: number) => {
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
  // const finalBlind = Math.max(currentUser.tokens - blind, 0);

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

  const updatedUser: UserGameData = {
    ...currentUser,
    bet: "fold"
  };
  return updatedUser;
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
    const prevTurn = getPrevTurn(turn, users.length);
    const prevUser = users[prevTurn];

    if (prevUser.bet !== "fold" && !isAllIn(prevUser)) {
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

export const gameStarted = (game: GameDataCore | GameDataUI) =>
  !game.users.every(u => u.hand === null);

const isAllIn = (user: UserGameData) => user.tokens === 0;

const isPreflop = (gameData: GameDataCore | GameDataUI) => {
  return gameData.flop === null;
};
export const isSmallBlind = (gameData: GameDataCore | GameDataUI) =>
  isPreflop(gameData) && gameData.users.every(d => d.bet === null);

export const isBigBlind = (gameData: GameDataCore | GameDataUI) =>
  isPreflop(gameData) &&
  gameData.users.filter(d => d.bet !== null).length === 1;

const isBigOrSmallBlind = (gameData: GameDataCore) =>
  isSmallBlind(gameData) || isBigBlind(gameData);

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

export const makeNewGame = (
  creatorId: string,
  userIds: string[]
): GameDataCore => {
  const creatorIndex = userIds.indexOf(creatorId);

  const game = newGame();
  if (creatorIndex === -1) {
    throw "Creator is not present in list.";
  }

  const actions: Action[] = userIds.map(u => ({
    type: "add-player",
    payload: u
  }));
  const result1 = actions.reduce(gameReducer, game);
  const result2 = gameReducer(result1, { type: "deal" });
  return { ...result2, turn: creatorIndex, startTurn: creatorIndex };
};

export const checkGameIsNotOver = (gameData: GameDataCore) => {
  if (gameData.flop?.length === 5) {
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
