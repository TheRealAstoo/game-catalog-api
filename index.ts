import * as dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { makeApp } from "./src/server/server";
import bodyParser from "body-parser";


dotenv.config();

const options = { useNewUrlParser: true, useUnifiedTopology: true };
const databaseUrl: string = process.env.MONGO_URL || "";

MongoClient.connect(databaseUrl, options).then((client) => {
  const db = client.db();
  const app = makeApp(db);

  
  app.use(bodyParser.urlencoded({extended: true}));


  
  app.listen(process.env.PORT, () => {
    console.log(`Server listening on port: ${process.env.PORT}`);
  });
});
