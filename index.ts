import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import * as dotenv from "dotenv";
import { addGame, getGames, removeGame, updateGame } from "./src/in-memory-db";

dotenv.config();
const app = express();
const jsonParser = bodyParser.json();

// Your code go here

// This should be the last call to `app` in this file
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(error);
  next();
});

app.listen(process.env.PORT, () => {
  console.log(`Server listening on port: ${process.env.PORT}`);
});
