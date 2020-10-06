import fetch from "node-fetch";
import { reset } from "../src/in-memory-db";
import { makeApp } from "../src/server";
import { Server } from "http";
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";

dotenv.config();

let app: Server;
let mongoClient: MongoClient;
let logger: jest.SpyInstance;

const options = { useNewUrlParser: true, useUnifiedTopology: true };
const databaseUrl = process.env.MONGO_URL || "";

beforeAll(async () => {
  const testURL = new URL(databaseUrl);
  testURL.pathname = testURL.pathname + "-test";
  mongoClient = await MongoClient.connect(databaseUrl.toString(), options);
  const db = mongoClient.db();
  const collections = await db.listCollections().toArray();
  for await (const collection of collections) {
    await db.collection(collection.name).drop();
  }
});

afterAll(async () => {
  await mongoClient.close();
});

beforeEach((done) => {
  app = makeApp(mongoClient.db()).listen(3001, done);
  reset();
  logger = jest.spyOn(console, "log").mockImplementation();
});

afterEach(async () => {
  logger.mockRestore();
  app.close();
  const db = mongoClient.db();
  const collections = await db.listCollections().toArray();
  for await (const collection of collections) {
    await db.collection(collection.name).drop();
  }
});

describe("Game: Update", () => {
  beforeEach(() => {
    return fetch("http://localhost:3001/platforms", {
      method: "POST",
      body: JSON.stringify({ name: "Nintendo Switch" }),
      headers: { "Content-Type": "application/json" },
    })
      .then(() =>
        fetch("http://localhost:3001/platforms", {
          method: "POST",
          body: JSON.stringify({ name: "Nintendo 3DS" }),
          headers: { "Content-Type": "application/json" },
        })
      )
      .then(() =>
        fetch("http://localhost:3001/games", {
          method: "POST",
          body: JSON.stringify({
            name: "Hades",
            platform_slug: "nintendo-switch",
          }),
          headers: { "Content-Type": "application/json" },
        })
      )
      .then(() =>
        fetch("http://localhost:3001/games", {
          method: "POST",
          body: JSON.stringify({
            name: "Mario Kart 7",
            platform_slug: "nintendo-3ds",
          }),
          headers: { "Content-Type": "application/json" },
        })
      );
  });

  test("should be able to update a game that exists", () => {
    expect.assertions(1);

    return fetch("http://localhost:3001/games/mario-kart-7", {
      method: "PUT",
      body: JSON.stringify({
        name: "Super Mario Kart 7",
        platform_slug: "nintendo-3ds",
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then(() => fetch("http://localhost:3001/games/mario-kart-7"))
      .then((response) => response.json())
      .then((game) => {
        expect(game).toMatchObject({ name: "Super Mario Kart 7" });
      });
  });

  test("should return a 404 if we try to update a game that does not exist", () => {
    expect.assertions(1);

    return fetch("http://localhost:3001/games/super-giga-mario-kart-x", {
      method: "PUT",
      body: JSON.stringify({
        name: "Super Mario Kart 7",
        platform_slug: "nintendo-3ds",
      }),
      headers: { "Content-Type": "application/json" },
    }).then((response) => {
      expect(response.status).toBe(404);
    });
  });

  test("should return a 400 if we try to update a game without a name", () => {
    expect.assertions(2);

    return fetch("http://localhost:3001/games/mario-kart-7", {
      method: "PUT",
      body: JSON.stringify({
        platform_slug: "nintendo-3ds",
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        expect(response.status).toBe(400);
        return response.json();
      })
      .then((body) => {
        expect(body.missing).toContain("name");
      });
  });

  test("should return a 400 if we try to update a game without a platform_slug", () => {
    expect.assertions(2);

    return fetch("http://localhost:3001/games/mario-kart-7", {
      method: "PUT",
      body: JSON.stringify({
        name: "Super Mario Kart 7",
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        expect(response.status).toBe(400);
        return response.json();
      })
      .then((body) => {
        expect(body.missing).toContain("platform_slug");
      });
  });
});
