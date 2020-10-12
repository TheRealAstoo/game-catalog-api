import fetch from "node-fetch";
import { reset } from "../src/server/in-memory-db";
import { makeApp } from "../src/server/server";
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

describe("Platforms: Delete", () => {
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

  test("should be able to delete a platform", () => {
    expect.assertions(2);

    return fetch("http://localhost:3001/platforms/nintendo-switch", {
      method: "DELETE",
    })
      .then((response) => {
        expect(response.status).toBe(204);
      })
      .then(() => fetch("http://localhost:3001/platforms/nintendo-switch"))
      .then((response) => {
        expect(response.status).toBe(404);
      });
  });

  test("should return a 404 when trying to delete a platform that does not exist", () => {
    expect.assertions(1);

    return fetch("http://localhost:3001/platforms/nintendo-x", {
      method: "DELETE",
    }).then((response) => {
      expect(response.status).toBe(404);
    });
  });
});
