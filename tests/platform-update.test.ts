import fetch from "node-fetch";
import { reset } from "../src/in-memory-db";
import server from "../src/server";
import { Server } from "http";

let app: Server;
let logger: jest.SpyInstance;

beforeEach((done) => {
  app = server.listen(3001, done);
  reset();
  logger = jest.spyOn(console, "log").mockImplementation();
});

afterEach((done) => {
  logger.mockRestore();
  app.close(done);
});

describe("Platforms: Update", () => {
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

  test("should be able to update a platform that exists", () => {
    expect.hasAssertions();
  });

  test("should return a 404 if we try to update a platform that does not exist", () => {
    expect.hasAssertions();
  });
});
