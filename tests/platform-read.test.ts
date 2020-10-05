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
    expect.hasAssertions();
  });

  test("It should return a platform when getting one from its ID", () => {
    expect.hasAssertions();
  });

  test("It should return a 404 if the platform does not exist", () => {
    expect.hasAssertions();
  });
});
