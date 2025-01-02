const express = require("express");
const cors = require("cors");

const app = express();
const db = require("./db");
const router = require("./routes");

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());
app.use("/", router);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY,
      workout_date TEXT NOT NULL,
      workout_notes TEXT,
      bodyweight REAL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS exercises (
      exercise_id INTEGER PRIMARY KEY,
      exercise_name TEXT NOT NULL,
      exercise_weight REAL,
      reps INTEGER,
      sets INTEGER,
      rest_between_sets TEXT,
      exercise_complete INTEGER,
      intensity INTEGER,
      exercise_notes TEXT,
      workout_id INT,
      FOREIGN KEY (workout_id) REFERENCES workouts(workout_id)
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
