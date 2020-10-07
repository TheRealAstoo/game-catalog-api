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
  mongoClient = await MongoClient.connect(testURL.toString(), options);
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

describe("Games: Create", () => {
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

  test("It should be able to add a game", () => {
    expect.assertions(2);

    return fetch("http://localhost:3001/games", {
      method: "POST",
      body: JSON.stringify({
        name: "The World Ends With You",
        platform_slug: "nintendo-3ds",
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        expect(response.status).toBe(201);
      })
      .then(() => fetch("http://localhost:3001/games/the-world-ends-with-you"))
      .then((response) => response.json())
      .then((game) => {
        expect(game).toMatchObject({
          name: "The World Ends With You",
          slug: "the-world-ends-with-you",
          platform_slug: "nintendo-3ds",
        });
      });
  });

  test("shouldn't be able to add a game if we don't send a name", () => {
    expect.assertions(2);

    return fetch("http://localhost:3001/games", {
      method: "POST",
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

  test("shouldn't be able to add a game if we don't send a platform_slug", () => {
    expect.assertions(2);

    return fetch("http://localhost:3001/games", {
      method: "POST",
      body: JSON.stringify({
        name: "The World Ends With You",
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

  test("shouldn't be able to add a game if the platform does not exist", () => {
    expect.hasAssertions();

    return fetch("http://localhost:3001/games", {
      method: "POST",
      body: JSON.stringify({
        name: "Metal Slug",
        platform_slug: "super-nintendo",
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        expect(response.status).toBe(400);
        return response.json();
      })
      .then((body) => {
        expect(body.error).toBe("This platform does not exist");
      });
  });

  test("shouldn't be able to add a game with a name that is already taken", () => {
    expect.hasAssertions();

    return fetch("http://localhost:3001/games", {
      method: "POST",
      body: JSON.stringify({ name: "Hades", platform_slug: "nintendo-switch" }),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        expect(response.status).toBe(400);
        return response.json();
      })
      .then((body) => {
        expect(body.error).toBe("A game of this name already exists");
      });
  });
});
