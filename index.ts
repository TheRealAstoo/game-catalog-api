import * as dotenv from "dotenv";
import app from "./src/server";

dotenv.config();

app.listen(process.env.PORT, () => {
  console.log(`Server listening on port: ${process.env.PORT}`);
});
