type Game = {
  id: number;
  name: string;
};

let GAMES: Game[] = [];

export function getGames(): Game[] {
  return GAMES;
}

export function addGame(name: string): Game {
  const game = {
    id: GAMES.length + 1,
    name,
  };
  GAMES.push(game);
  console.log(`added a game: ${name}, id: ${game.id}`);
  return game;
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
