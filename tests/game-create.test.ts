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
          body: JSON.stringify({ name: "Hades", platform_id: 1 }),
          headers: { "Content-Type": "application/json" },
        })
      )
      .then(() =>
        fetch("http://localhost:3001/games", {
          method: "POST",
          body: JSON.stringify({ name: "Mario Kart 7", platform_id: 2 }),
          headers: { "Content-Type": "application/json" },
        })
      );
  });

  test("It should be able to add a game", () => {
    expect.hasAssertions();
  });

  test("shouldn't be able to add a game if we don't send a name", () => {
    expect.hasAssertions();
  });

  test("shouldn't be able to add a game if we don't send a platform_id", () => {
    expect.hasAssertions();
  });

  test("shouldn't be able to add a game if the platform does not exist", () => {
    expect.hasAssertions();
  });

  test("shouldn't be able to add a game with a name that is already taken", () => {
    expect.hasAssertions();
  });
});
