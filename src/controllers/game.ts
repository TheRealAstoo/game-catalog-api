import { Request, Response } from "express";
import { GameModel } from "../models/game";
import { PlatformModel } from "../models/platform";
import slugify from "slug";
import express from "express";

const clientWantsJson = (request: express.Request): boolean => request.get("accept") === "application/json";

export function index(model: GameModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const games = await model.findAll()
    const colors = ["is-primary", "is-warning", "is-info", "is-danger", "is-success"];
    response.json(games);

    if (clientWantsJson(request)) {
      response.json(games)
    } else {
      response.render("games", { games, colors });
    }
  }
}

export function indexPerPlatform(model: GameModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const games = await model.findInPlatformBySlug(request.params.slug)
    response.json(games);
  }
}

export function show(model: GameModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const game = await model.findBySlug(request.params.slug);
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
  }
}

export function create(model: GameModel, platforms: PlatformModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const errors = [];
    if (!request.body.name) {
      errors.push("name");
    }
    if (!request.body.platform_slug) {
      errors.push("platform_slug");
    }
    if (errors.length > 0) {
      response
        .status(400)
        .json({ error: "Missing required fields", missing: errors });
      return 
    }
    const alreadyExistingGame = await model.findByName(
      request.body.name
    );

    if (alreadyExistingGame) {
      response
        .status(400)
        .json({ error: "A game of this name already exists" });
      return
    }

    const platform = await platforms.findBySlug( request.body.platform_slug );

    if (platform) {
      const slug = slugify(request.body.name);
      const createdGame = {
        name: request.body.name,
        slug: slug,
        platform_slug: platform.slug,
      };

      model.insertOne(createdGame).then(() => {
        response.status(201).json(createdGame);
      });
    } else {
      response
        .status(400)
        .json({ error: "This platform does not exist" });
      return
    }
  }
}

export function destroy(model: GameModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const game = await model.findBySlug( request.params.slug );
    if (game) {
      await model.destroy( game.slug );

      response.status(204).end();
    } else {
      response.status(404).end();
    }
  }
}

export function update(model: GameModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const errors = [];
    if (!request.body.name) {
      errors.push("name");
    }
    if (!request.body.platform_slug) {
      errors.push("platform_slug");
    }
    if (errors.length > 0) {
      response
        .status(400)
        .json({ error: "Missing required fields", missing: errors });
      return 
    }
    const result = await model.updateOne(
      request.params.slug,
      request.body.name
    );
    if (result === "ok") {
      response.status(204).end();
    } else {
      response.status(404).end();
    }
  }
}
