import * as dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { makeApp } from "./src/server/server";
import exhbs from "express-handlebars";
import express from "express";
import bodyParser from "body-parser";


dotenv.config();

const options = { useNewUrlParser: true, useUnifiedTopology: true };
const databaseUrl: string = process.env.MONGO_URL || "";

MongoClient.connect(databaseUrl, options).then((client) => {
  const db = client.db();
  const app = makeApp(db);

  app.use(express.static(__dirname + "/public"));
  app.use(bodyParser.urlencoded({extended: true}));

  app.set("view engine", "hbs");
  app.engine("hbs", exhbs({
    extname: "hbs",
    defaultLayout: `${__dirname}/src/views/layouts/index`,
    layoutsDir: `${__dirname}/src/views/layouts`,
    partialsDir: `${__dirname}/src/views/partials`,
  }));
  
  app.listen(process.env.PORT, () => {
    console.log(`Server listening on port: ${process.env.PORT}`);
  });
});
