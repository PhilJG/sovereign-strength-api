const express = require("express");
const router = express.Router();
const db = require("./db");

router.post("/workouts", (req, res) => {
  const { workout_date, workout_notes, bodyweight } = req.body;

  db.run(
    `
      INSERT INTO workouts (workout_date, workout_notes, bodyweight)
      VALUES (?, ?, ?);
    `,
    [workout_date, workout_notes, bodyweight],
    (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
        return;
      }

      res.json({ message: "Workout created successfully" });
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
  } = req.body;

  db.run(
    `
      INSERT INTO exercises (exercise_name, exercise_weight, reps, sets, rest_between_sets, exercise_complete, intensity, exercise_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
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
    ],
    (err) => {
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

module.exports = router;
