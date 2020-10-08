import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import * as core from "express-serve-static-core";
import slugify from "slug";
import { Db } from "mongodb";
import * as platformController from "./controllers/platform";
import { PlatformModel } from "./models/platform";

export function makeApp(db: Db): core.Express {
  const app = express();
  const jsonParser = bodyParser.json();
  const platformModel = new PlatformModel(db.collection("platforms"));

  app.get("/platforms", platformController.index(platformModel));
  app.get("/platforms/:slug", platformController.show(platformModel));
  app.post("/platforms", jsonParser, platformController.create(platformModel));
  app.delete(
    "/platforms/:slug",
    jsonParser,
    platformController.destroy(platformModel)
  );
  app.put(
    "/platforms/:slug",
    jsonParser,
    platformController.update(platformModel)
  );

  app.get(
    "/platforms/:slug/games",
    async (request: Request, response: Response) => {
      const games = await db
        .collection("games")
        .find({ platform_slug: request.params.slug })
        .toArray();
      response.json(games);
    }
  );

  app.get("/games", async (request: Request, response: Response) => {
    const games = await db.collection("games").find().toArray();
    response.json(games);
  });

  app.get("/games/:slug", async (request: Request, response: Response) => {
    const game = await db.collection("games").findOne({
      slug: request.params.slug,
    });
    if (game) {
      const gameView = {
        name: game.name,
        slug: game.slug,
        platform_slug: game.platform_slug,
      };
      response.json(gameView);
    } else {
      response.status(404).end();
    }
  });

  app.post(
    "/games",
    jsonParser,
    async (request: Request, response: Response) => {
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
      const alreadyExistingGame = await db.collection("games").findOne({
        name: request.body.name,
        platform_slug: request.body.platform_slug,
      });

      if (alreadyExistingGame) {
        return response
          .status(400)
          .json({ error: "A game of this name already exists" });
      }

      const platform = await db
        .collection("platforms")
        .findOne({ slug: request.body.platform_slug });

      if (platform) {
        const slug = slugify(request.body.name);
        const createdGame = {
          name: request.body.name,
          slug: slug,
          platform_slug: platform.slug,
        };

        db.collection("games").insertOne(createdGame);
        response.status(201).json(createdGame);
      } else {
        response.status(400).json({ error: "This platform does not exist" });
      }
    }
  );

  app.delete("/games/:slug", async (request: Request, response: Response) => {
    const game = await db
      .collection("games")
      .findOne({ slug: request.params.slug });
    if (game) {
      await db.collection("games").deleteOne({ _id: game._id });

      response.status(204).end();
    } else {
      response.status(404).end();
    }
  });

  app.put(
    "/games/:slug",
    jsonParser,
    async (request: Request, response: Response) => {
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
      const game = await db
        .collection("games")
        .findOne({ slug: request.params.slug });
      if (game) {
        const newGame = { ...game, ...request.body };
        await db.collection("games").replaceOne({ _id: game._id }, newGame);

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
