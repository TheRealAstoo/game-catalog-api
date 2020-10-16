import * as mongo from "mongodb";
import * as dotenv from "dotenv";

dotenv.config();

const databaseUrl = process.env.MONGO_URL || "";

const options = { useNewUrlParser: true, useUnifiedTopology: true };

export default (): Promise<mongo.MongoClient> => {
  return new Promise((resolve, reject) => {
    mongo.MongoClient.connect(databaseUrl, options, (error, client) => {
      if (error) {
        reject(error);
      } else {
        resolve(client);
      }
    });
  });
};
