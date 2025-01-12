import express from "express";
const router = express.Router();
import { createObjectCsvWriter } from "csv-writer";
import PDFDocument from "pdfkit";
import fs from "fs";
import db from "./db.js";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = `${__dirname}/workout_data.csv`;

// Export data

router.get("/csv", async (req, res) => {
  const data = await db.query(`
    SELECT * FROM workouts`);

  const workoutlist = data.rows;

  console.log(workoutlist);

  const header = workoutlist.length > 0 ? Object.keys(workoutlist[0]) : [];

  const csvWriter = createObjectCsvWriter({
    path: "workout_data.csv",
    header: header,
  });

  csvWriter
    .writeRecords(workoutlist)
    .then(() => {
      res.download(filePath);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Error export data to csv" });
    });
});

router.get("/export/pdf", async (req, res) => {
  const data = await db.query(`
    SELECT * FROM workouts`);

  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream("workout_data.pdf"));

  doc.fontSize(25).text("Workout Data", { align: "center" });
  doc.moveDown();

  data.forEach((row, i) => {
    doc.fontSize(12).text(`${row.exercise}: ${row.weight} lbs`, {
      align: "left",
    });
    doc.moveDown();
  });

  doc.end();

  res.download("workout_data.pdf");
});

// Post data

router.post("/workouts", (req, res) => {
  const { workout_date, workout_notes, bodyweight } = req.body;

  const bodyweightValue = bodyweight === "" ? null : bodyweight;
  const workoutNotesValue = workout_notes === "" ? null : workout_notes;

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
  try {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Review data

router.get("/workouts", (req, res) => {
  db.query(
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
  db.query(
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
