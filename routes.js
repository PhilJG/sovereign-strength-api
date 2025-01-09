import express from "express";
import db from "./db.js";

const router = express.Router();

router.post("/workouts", (req, res) => {
  const { workout_date, workout_notes, bodyweight } = req.body;

  db.query(
    `
      INSERT INTO workouts 
      (workout_date, workout_notes, bodyweight)
      VALUES ($1, $2, $3)
      RETURNING workout_id;
    `,
    [workout_date, workout_notes, bodyweight],

    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
        return;
      }

      res.json({ id: result.rows[0].workout_id });
    }
  );
});

router.post("/exercises", (req, res) => {
  console.log("running post");
  const {
    exercise_name,
    exercise_weight,
    reps,
    sets,
    rest_between_sets,
    exercise_complete,
    intensity,
    exercise_notes,
    workout_id,
  } = req.body;

  db.query(
    `
      INSERT INTO exercises (exercise_name, exercise_weight, reps, sets, rest_between_sets, exercise_complete, intensity, exercise_notes, workout_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
    `,
    [
      exercise_name,
      exercise_weight,
      reps,
      sets,
      rest_between_sets,
      exercise_complete,
      intensity,
      exercise_notes,
      workout_id,
    ],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
        return;
      }

      res.json({ message: `${exercise_name} posted successfully` });
    }
  );
});

router.get("/workouts", (req, res) => {
  db.all(
    `
      SELECT * FROM workouts;
    `,
    (err, rows) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
        return;
      }

      res.json(rows);
    }
  );
});

router.get("/exercises", (req, res) => {
  db.all(
    `
      SELECT * FROM exercises;
    `,
    (err, rows) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
        return;
      }

      res.json(rows);
    }
  );
});

export default router;
