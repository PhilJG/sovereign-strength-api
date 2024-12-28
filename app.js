const express = require("express");
const app = express();
const db = require("./db");
const router = require("./routes");

app.use(express.json());
app.use("/api", router);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY,
      workout_date TEXT NOT NULL,
      workout_notes TEXT,
      bodyweight REAL
    );
  `);
  console.log("serialize starting...");
});

db.on("open", () => {
  console.log("Database connection established");
  app.listen(3000, () => {
    console.log("Server listening on port 3000");
  });
});
