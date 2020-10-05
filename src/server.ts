import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import {
  addGame,
  addPlatform,
  findGame,
  findGamesByPlatformId,
  findPlatform,
  findPlatformByName,
  getGames,
  getPlatforms,
  PlatformNotFoundError,
  removeGame,
  removePlatform,
  updateGame,
  updatePlatform,
} from "./in-memory-db";

const app = express();
const jsonParser = bodyParser.json();

app.get("/platforms", (request: Request, response: Response) => {
  const platforms = getPlatforms();
  response.json(platforms);
});

app.get("/platforms/:id", (request: Request, response: Response) => {
  const platform = findPlatform(parseFloat(request.params.id));
  if (platform) {
    response.json(platform);
  } else {
    response.status(404).end();
  }
});

app.post("/platforms", jsonParser, (request: Request, response: Response) => {
  const errors = [];
  if (!request.body.name) {
    errors.push("name");
  }
  if (errors.length > 0) {
    return response
      .status(400)
      .json({ error: "Missing required fields", missing: errors });
  }

  if (findPlatformByName(request.body.name)) {
    return response
      .status(400)
      .json({ error: "A platform of this name already exists" });
  }

  const createdPlatform = addPlatform(request.body.name);

  response.status(201).json(createdPlatform);
});

app.put(
  "/platforms/:id",
  jsonParser,
  (request: Request, response: Response) => {
    const platform = findPlatform(parseFloat(request.params.id));
    if (platform) {
      const newPlatform = { ...platform, ...request.body };
      updatePlatform(platform.id, newPlatform);

      response.status(204).end();
    } else {
      response.status(404).end();
    }
  }
);

app.delete(
  "/platforms/:id",
  jsonParser,
  (request: Request, response: Response) => {
    const platform = findPlatform(parseFloat(request.params.id));
    if (platform) {
      removePlatform(platform.id);

      response.status(204).end();
    } else {
      response.status(404).end();
    }
  }
);

app.get("/platforms/:id/games", (request: Request, response: Response) => {
  const games = findGamesByPlatformId(parseFloat(request.params.id));
  response.json(games);
});

app.get("/games", (request: Request, response: Response) => {
  const games = getGames();
  response.json(games);
});

app.get("/games/:id", (request: Request, response: Response) => {
  const game = findGame(parseFloat(request.params.id));
  if (game) {
    response.json(game);
  } else {
    response.status(404).end();
  }
});

app.post("/games", jsonParser, (request: Request, response: Response) => {
  const errors = [];
  if (!request.body.name) {
    errors.push("name");
  }
  if (!request.body.platform_id) {
    errors.push("platform_id");
  }
  if (errors.length > 0) {
    return response
      .status(400)
      .json({ error: "Missing required fields", missing: errors });
  }

  const games = getGames();
  if (games.find((game) => game.name === request.body.name)) {
    return response
      .status(400)
      .json({ error: "A game of this name already exists" });
  }

  try {
    const createdGame = addGame(
      request.body.name,
      parseFloat(request.body.platform_id)
    );

    response.status(201).json(createdGame);
  } catch (error) {
    console.log(error, error instanceof PlatformNotFoundError);
    if (error instanceof PlatformNotFoundError) {
      response.status(400).json({ error: "This platform does not exist" });
    } else {
      response.status(500).send(error.message);
    }
  }
});

app.delete("/games/:id", (request: Request, response: Response) => {
  const game = findGame(parseFloat(request.params.id));
  if (game) {
    removeGame(game.id);

    response.status(204).end();
  } else {
    response.status(404).end();
  }
});

app.put("/games/:id", jsonParser, (request: Request, response: Response) => {
  const errors = [];
  if (!request.body.name) {
    errors.push("name");
  }
  if (!request.body.platform_id) {
    errors.push("platform_id");
  }
  if (errors.length > 0) {
    return response
      .status(400)
      .json({ error: "Missing required fields", missing: errors });
  }
  const game = findGame(parseFloat(request.params.id));
  if (game) {
    const newGame = { ...game, ...request.body };
    updateGame(game.id, newGame);

    response.status(204).end();
  } else {
    response.status(404).end();
  }
});

// This should be the last call to `app` in this file
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(error);
  next();
});

export default app;
