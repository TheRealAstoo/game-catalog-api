import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import * as core from "express-serve-static-core";
import { Db } from "mongodb";
import * as platformController from "../controllers/platform";
import { PlatformModel } from "../models/platform";
import * as gameController from "../controllers/game";
import { GameModel } from "../models/game";


export function makeApp(db: Db): core.Express {
  const app = express();
  const jsonParser = bodyParser.json();
  const platformModel = new PlatformModel(db.collection("platforms"));
  const gameModel = new GameModel(db.collection("games"))

  app.get('/', (req, res) => {
    res.render('/Users/louisfanien/Workspace/game-catalog-mvc/game-catalog-deployment/src/views/main.hbs');
  })
  app.get("/platforms", platformController.index(platformModel));
  app.get("/platforms/:slug", platformController.show(platformModel));
  app.post("/platforms", jsonParser, platformController.create(platformModel));
  app.delete("/platforms/:slug",jsonParser,platformController.destroy(platformModel));
  app.put("/platforms/:slug",jsonParser,platformController.update(platformModel));

  app.get("/games", gameController.index(gameModel));
  app.get("/platforms/:slug/games", gameController.indexPerPlatform(gameModel));
  app.get("/games/:slug", gameController.show(gameModel));
  app.post("/games",jsonParser, gameController.create(gameModel, platformModel));
  app.delete("/games/:slug", gameController.destroy(gameModel));
  app.put("/games/:slug", jsonParser, gameController.update(gameModel));

  // This should be the last call to `app` in this file
  app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(error);
    next();
  });

  return app;
}
