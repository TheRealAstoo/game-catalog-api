type Game = {
  id: number;
  name: string;
  platform_id: number;
};
type Platform = {
  id: number;
  name: string;
};

let lastGameId = 0;
let lastPlatformId = 0;

export class PlatformNotFoundError extends Error {
  constructor(message: string) {
    super(message);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, PlatformNotFoundError.prototype);
  }
}

let GAMES: Game[] = [];
let PLATFORMS: Platform[] = [];

export function reset(): void {
  // This function is for tests only
  GAMES = [];
  PLATFORMS = [];
  lastGameId = 0;
  lastPlatformId = 0;
}

export function getGames(): Game[] {
  return GAMES;
}

export function addGame(name: string, platformId: number): Game {
  const platform = PLATFORMS.find((platform) => platform.id === platformId);
  if (platform) {
    const newId = lastGameId + 1;
    lastGameId = newId;
    const game = {
      id: newId,
      name,
      platform_id: platformId,
    };
    GAMES.push(game);
    console.log(`added a game: ${name}, id: ${game.id}`);
    return game;
  } else {
    throw new PlatformNotFoundError(`Platform ${platformId} does not exist`);
  }
}

export function removeGame(gameId: number): void {
  const removedGame = GAMES.find((game) => game.id === gameId);
  if (removedGame) {
    console.log(`removed a game: ${removedGame.id}`);
    GAMES = GAMES.filter((game) => game.id !== gameId);
  }
}

export function updateGame(gameId: number, updatedGame: Game): Game {
  GAMES = GAMES.map((game) => {
    if (game.id === gameId) {
      console.log(`updated a game: ${game.id}`);
      return { ...updatedGame, id: game.id };
    }
    return game;
  });
  return updatedGame;
}

export function findGame(gameId: number): Game | undefined {
  return getGames().find((game) => game.id === gameId);
}

export function findGamesByPlatformId(platformId: number): Game[] {
  return getGames().filter((game) => game.platform_id === platformId);
}

export function getPlatforms(): Platform[] {
  return PLATFORMS;
}

export function addPlatform(name: string): Platform {
  const newId = lastPlatformId + 1;
  lastPlatformId = newId;
  const platform = {
    id: newId,
    name,
  };
  PLATFORMS.push(platform);

  console.log(`added a platform: ${name}, id: ${platform.id}`);
  return platform;
}

export function removePlatform(platformId: number): void {
  const removedPlatform = PLATFORMS.find(
    (platform) => platform.id === platformId
  );
  if (removedPlatform) {
    console.log(`removed a platform: ${removedPlatform.id}`);

    PLATFORMS = PLATFORMS.filter((platform) => platform.id !== platformId);
    const gamesForThatPlatform = GAMES.filter(
      (game) => game.platform_id === platformId
    );
    gamesForThatPlatform.forEach((game) => removeGame(game.id));
  }
}

export function findPlatform(platformId: number): Platform | undefined {
  return getPlatforms().find((platform) => platform.id === platformId);
}

export function findPlatformByName(platformName: string): Platform | undefined {
  return getPlatforms().find((platform) => platform.name === platformName);
}

export function updatePlatform(
  platformId: number,
  updatedPlatform: Platform
): Platform {
  PLATFORMS = PLATFORMS.map((platform) => {
    if (platform.id === platformId) {
      console.log(`updated a plateform: ${platform.id}`);
      return { ...updatedPlatform, id: platform.id };
    }
    return platform;
  });
  return updatedPlatform;
}
