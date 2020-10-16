import initDb from "../utils/initDatabase";

initDb()
  .then(async (client) => {
    const db = client.db();

    const collections = await db.listCollections().toArray();
    const collectionsNames = collections.map((collection) => collection.name);

    await Promise.all(
      collectionsNames.map(async (name) => {
        await db.collection(name).drop();
        console.log(`Collection '${name}' dropped`);
      }),
    );

    client.close();
  })
  .catch(console.error);
