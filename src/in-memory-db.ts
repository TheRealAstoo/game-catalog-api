type Game = {
  id: number;
  name: string;
  platform_slug: string;
  slug: string;
};
type Platform = {
  id: number;
  name: string;
  slug: string;
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

export function addGame(
  name: string,
  slug: string,
  platformSlug: string
): Game {
  const platform = findPlatform(platformSlug);
  if (platform) {
    const newId = lastGameId + 1;
    lastGameId = newId;
    const game = {
      id: newId,
      name,
      platform_slug: platformSlug,
      slug: slug,
    };
    GAMES.push(game);
    console.log(`added a game: ${name}, id: ${game.id}`);
    return game;
  } else {
    throw new PlatformNotFoundError(`Platform ${platformSlug} does not exist`);
  }
}

export function removeGame(gameSlug: string): void {
  const removedGame = GAMES.find((game) => game.slug === gameSlug);
  if (removedGame) {
    console.log(`removed a game: ${removedGame.id}`);
    GAMES = GAMES.filter((game) => game.slug !== gameSlug);
  }
}

export function updateGame(gameSlug: string, updatedGame: Game): Game {
  GAMES = GAMES.map((game) => {
    if (game.slug === gameSlug) {
      console.log(`updated a game: ${game.id}`);
      return { ...updatedGame, id: game.id };
    }
    return game;
  });
  return updatedGame;
}

export function findGame(gameSlug: string): Game | undefined {
  return getGames().find((game) => game.slug === gameSlug);
}

export function findGamesByPlatformId(platformSlug: string): Game[] {
  return getGames().filter((game) => game.platform_slug === platformSlug);
}

export function getPlatforms(): Platform[] {
  return PLATFORMS;
}

export function addPlatform(name: string, slug: string): Platform {
  const newId = lastPlatformId + 1;
  lastPlatformId = newId;
  const platform = {
    id: newId,
    name,
    slug,
  };
  PLATFORMS.push(platform);

  console.log(`added a platform: ${name}, id: ${platform.id}`);
  return platform;
}

export function removePlatform(platformSlug: string): void {
  const removedPlatform = PLATFORMS.find(
    (platform) => platform.slug === platformSlug
  );
  if (removedPlatform) {
    console.log(`removed a platform: ${removedPlatform.id}`);

    PLATFORMS = PLATFORMS.filter((platform) => platform.slug !== platformSlug);
    const gamesForThatPlatform = GAMES.filter(
      (game) => game.platform_slug === platformSlug
    );
    gamesForThatPlatform.forEach((game) => removeGame(game.slug));
  }
}

export function findPlatform(platformSlug: string): Platform | undefined {
  return getPlatforms().find((platform) => platform.slug === platformSlug);
}

export function findPlatformByName(platformName: string): Platform | undefined {
  return getPlatforms().find((platform) => platform.name === platformName);
}

export function updatePlatform(
  platformSlug: string,
  updatedPlatform: Platform
): Platform {
  PLATFORMS = PLATFORMS.map((platform) => {
    if (platform.slug === platformSlug) {
      console.log(`updated a plateform: ${platform.id}`);
      return { ...updatedPlatform, id: platform.id };
    }
    return platform;
  });
  return updatedPlatform;
}
