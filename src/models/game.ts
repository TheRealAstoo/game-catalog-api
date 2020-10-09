import { Collection, ObjectID } from "mongodb";

type Game = {
  _id: ObjectID;
  name: string;
  slug: string;
  platform_slug: string;
};

type GameInput = {
  name: string;
  slug: string;
  platform_slug: string;
};

export class GameModel {
  collection: Collection<Game>;

  constructor(collection: Collection<Game>) {
    this.collection = collection;
  }

  findAll(): Promise<Game[]> {
    return this.collection.find().toArray();
  }

  findInPlatformBySlug(slug: string): Promise<Game[]> {
    return this.collection
        .find({ platform_slug:  slug})
        .toArray();
  }

  findBySlug(slug: string): Promise<Game | null> {
    return this.collection.findOne({ slug: slug })
  }

  findByName(name: string): Promise<Game | null> {
    return this.collection.findOne({ name: name })
  }

  insertOne(createdGame: GameInput): Promise<boolean> {
    return this.collection.insertOne(createdGame)
    .then(() => true)
    .catch(() => false);
  }

  destroy(slug: string): Promise<boolean> {
    return this.collection
      .deleteOne({ slug: slug })
      .then(() => true)
      .catch(() => false);
  }

  updateOne(
    slug: string,
    newName: string
  ): Promise<"game_not_found" | "ok"> {
    return this.findBySlug(slug).then((game) => {
      if (game) {
        return this.collection
          .replaceOne({ slug: game.slug }, { ...game, name: newName })
          .then(() => "ok");
      } else {
        return "game_not_found";
      }
    });
  }
}