const express = require("express");
const router = express.Router();
const db = require("./db");

router.post("/workouts", (req, res) => {
  console.log("running post");
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

module.exports = router;
