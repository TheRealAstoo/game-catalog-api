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

describe("Platforms: Read", () => {
  beforeEach(() => {
    return fetch("http://localhost:3001/platforms", {
      method: "POST",
      body: JSON.stringify({ name: "Nintendo Switch" }),
      headers: { "Content-Type": "application/json" },
    }).then(() =>
      fetch("http://localhost:3001/platforms", {
        method: "POST",
        body: JSON.stringify({ name: "Nintendo 3DS" }),
        headers: { "Content-Type": "application/json" },
      })
    );
  });

  test("It should return an array of platforms when listing all the platforms", () => {
    expect.assertions(2);

    return fetch("http://localhost:3001/platforms")
      .then((response) => response.json())
      .then((platforms) => {
        expect(platforms.length).toBe(2);
        expect(platforms).toMatchObject([
          { name: "Nintendo Switch", slug: "nintendo-switch" },
          { name: "Nintendo 3DS", slug: "nintendo-3ds" },
        ]);
      });
  });

  test("It should return a platform when getting one from its slug", () => {
    expect.assertions(1);

    return fetch("http://localhost:3001/platforms/nintendo-switch")
      .then((response) => response.json())
      .then((platform) => {
        expect(platform).toMatchObject({
          name: "Nintendo Switch",
          slug: "nintendo-switch",
        });
      });
  });

  test("It should return a 404 if the platform does not exist", () => {
    expect.assertions(1);

    return fetch("http://localhost:3001/platforms/nintendo-x").then(
      (response) => {
        expect(response.status).toBe(404);
      }
    );
  });
});
