import cors from "cors";
import express from "express";

import db from "./db.js";
import router from "./routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());
app.use("/", router);

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
