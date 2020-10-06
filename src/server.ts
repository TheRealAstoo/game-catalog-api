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
import * as core from "express-serve-static-core";
import slugify from "slug";
import { Db } from "mongodb";

export function makeApp(db: Db): core.Express {
  const app = express();
  const jsonParser = bodyParser.json();

  app.get("/platforms", (request: Request, response: Response) => {
    const platforms = getPlatforms();
    response.json(platforms);
  });

  app.get("/platforms/:slug", (request: Request, response: Response) => {
    const platform = findPlatform(request.params.slug);
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

    const slug = slugify(request.body.name);
    const createdPlatform = addPlatform(request.body.name, slug);

    response.status(201).json(createdPlatform);
  });

  app.put(
    "/platforms/:slug",
    jsonParser,
    (request: Request, response: Response) => {
      const errors = [];
      if (!request.body.name) {
        errors.push("name");
      }
      if (errors.length > 0) {
        return response
          .status(400)
          .json({ error: "Missing required fields", missing: errors });
      }

      const platform = findPlatform(request.params.slug);
      if (platform) {
        const newPlatform = { ...platform, ...request.body };
        updatePlatform(platform.slug, newPlatform);

        response.status(204).end();
      } else {
        response.status(404).end();
      }
    }
  );

  app.delete(
    "/platforms/:slug",
    jsonParser,
    (request: Request, response: Response) => {
      const platform = findPlatform(request.params.slug);
      if (platform) {
        removePlatform(platform.slug);

        response.status(204).end();
      } else {
        response.status(404).end();
      }
    }
  );

  app.get("/platforms/:slug/games", (request: Request, response: Response) => {
    const games = findGamesByPlatformId(request.params.slug);
    response.json(games);
  });

  app.get("/games", (request: Request, response: Response) => {
    const games = getGames();
    response.json(games);
  });

  app.get("/games/:slug", (request: Request, response: Response) => {
    const game = findGame(request.params.slug);
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
    if (!request.body.platform_slug) {
      errors.push("platform_slug");
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
      const slug = slugify(request.body.name);
      const createdGame = addGame(
        request.body.name,
        slug,
        request.body.platform_slug
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

  app.delete("/games/:slug", (request: Request, response: Response) => {
    const game = findGame(request.params.slug);
    if (game) {
      removeGame(game.slug);

      response.status(204).end();
    } else {
      response.status(404).end();
    }
  });

  app.put(
    "/games/:slug",
    jsonParser,
    (request: Request, response: Response) => {
      const errors = [];
      if (!request.body.name) {
        errors.push("name");
      }
      if (!request.body.platform_slug) {
        errors.push("platform_slug");
      }
      if (errors.length > 0) {
        return response
          .status(400)
          .json({ error: "Missing required fields", missing: errors });
      }
      const game = findGame(request.params.slug);
      if (game) {
        const newGame = { ...game, ...request.body };
        updateGame(game.slug, newGame);

        response.status(204).end();
      } else {
        response.status(404).end();
      }
    }
  );

  // This should be the last call to `app` in this file
  app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(error);
    next();
  });

  return app;
}
