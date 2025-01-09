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

// const createTables = async () => {
//   try {
//     await new Promise((resolve, reject) => {
//       db.query(
//         `
//       CREATE TABLE IF NOT EXISTS workouts (
//         workout_id SERIAL PRIMARY KEY,
//         workout_date TEXT NOT NULL,
//         workout_notes TEXT,
//         bodyweight REAL
//       );
//     `,
//         (err, res) => {
//           console.error("Error creating tables:", err);
//         }
//       );
//     });

//     console.log("workouts table created successfully");

//     await new Promise((resolve, reject) => {
//       db.query(`
//       CREATE TABLE IF NOT EXISTS exercises (
//         exercise_id SERIAL PRIMARY KEY,
//         exercise_name TEXT NOT NULL,
//         exercise_weight REAL,
//         reps INTEGER,
//         sets INTEGER,
//         rest_between_sets TEXT,
//         exercise_complete INTEGER,
//         intensity INTEGER,
//         exercise_notes TEXT,
//         workout_id INTEGER,
//         FOREIGN KEY (workout_id) REFERENCES workouts(workout_id)
//       );
//     `),
//         console.log("exercises table created successfully");

//       (err, res) => {
//         console.error("Error creating tables:", err);
//       };
//     });

//     // console.log("Tables created successfully");
//   } catch (error) {
//     console.error("Error creating tables:", error);
//   }
// };

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
