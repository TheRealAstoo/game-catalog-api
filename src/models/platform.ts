import { Collection, ObjectID } from "mongodb";

type Platform = {
  _id: ObjectID;
  name: string;
  slug: string;
};

type PlatformInput = {
  name: string;
  slug: string;
};

export class PlatformModel {
  collection: Collection<Platform>;

  constructor(collection: Collection<Platform>) {
    this.collection = collection;
  }

  findAll(): Promise<Platform[]> {
    return this.collection.find().toArray();
  }

  findBySlug(slug: string): Promise<Platform | null> {
    return this.collection.findOne({ slug: slug });
  }

  findByName(name: string): Promise<Platform | null> {
    return this.collection.findOne({ name: name });
  }

  insertOne(createdPlatform: PlatformInput): Promise<boolean> {
    return this.collection
      .insertOne(createdPlatform)
      .then(() => true)
      .catch(() => false);
  }

  updateOne(
    slug: string,
    newName: string
  ): Promise<"platform_not_found" | "ok"> {
    return this.findBySlug(slug).then((platform) => {
      if (platform) {
        return this.collection
          .replaceOne({ slug: platform.slug }, { ...platform, name: newName })
          .then(() => "ok");
      } else {
        return "platform_not_found";
      }
    });
  }

  destroy(slug: string): Promise<boolean> {
    return this.collection
      .deleteOne({ slug: slug })
      .then(() => true)
      .catch(() => false);
  }
}
