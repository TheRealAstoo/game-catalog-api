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

function waitFor(seconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
}

describe("Platforms: Create", () => {
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

  test("should be able to add a platform", () => {
    expect.assertions(1);

    return fetch("http://localhost:3001/platforms", {
      method: "POST",
      body: JSON.stringify({ name: "Playstation 4" }),
      headers: { "Content-Type": "application/json" },
    })
      .then(() => waitFor(1))
      .then(() => fetch("http://localhost:3001/platforms/playstation-4"))
      .then((response) => response.json())
      .then((platform) => {
        expect(platform).toMatchObject({
          name: "Playstation 4",
          slug: "playstation-4",
        });
      });
  });

  test("shouldn't be able to add a platform if we don't send a name", () => {
    expect.assertions(2);

    return fetch("http://localhost:3001/platforms", {
      method: "POST",
      body: JSON.stringify({}),
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

  test("shouldn't be able to add a platform with a name that is already taken", () => {
    expect.assertions(2);

    return fetch("http://localhost:3001/platforms", {
      method: "POST",
      body: JSON.stringify({ name: "Nintendo Switch" }),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        expect(response.status).toBe(400);
        return response.json();
      })
      .then((body) => {
        expect(body.error).toBe("A platform of this name already exists");
      });
  });
});
