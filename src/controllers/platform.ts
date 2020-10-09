import { Request, Response } from "express";
import { PlatformModel } from "../models/platform";
import slugify from "slug";

export function index(model: PlatformModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const platformList = await model.findAll();
    response.json(platformList);
  };
}

export function show(model: PlatformModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const platform = await model.findBySlug(request.params.slug);

    if (platform) {
      response.json(platform);
    } else {
      response.status(404).end();
    }
  };
}

export function create(model: PlatformModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const errors = [];
    if (!request.body.name) {
      errors.push("name");
    }
    if (errors.length > 0) {
      response
        .status(400)
        .json({ error: "Missing required fields", missing: errors });
      return;
    }

    const platform = await model.findByName(request.body.name);

    if (platform) {
      response
        .status(400)
        .json({ error: "A platform of this name already exists" });
      return;
    }

    const slug = slugify(request.body.name);
    const createdPlatform = {
      name: request.body.name,
      slug: slug,
    };

    model.insertOne(createdPlatform).then(() => {
      response.status(201).json(createdPlatform);
    });
  };
}

export function destroy(model: PlatformModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const platform = await model.findBySlug(request.params.slug);
    if (platform) {
      await model.destroy(platform.slug);
      response.status(204).end();
    } else {
      response.status(404).end();
    }
  };
}

export function update(model: PlatformModel) {
  return async (request: Request, response: Response): Promise<void> => {
    const errors = [];
    if (!request.body.name) {
      errors.push("name");
    }
    if (errors.length > 0) {
      response
        .status(400)
        .json({ error: "Missing required fields", missing: errors });
      return;
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
  };
}
