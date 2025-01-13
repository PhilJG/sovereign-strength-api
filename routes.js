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
    SELECT w.workout_id, w.workout_date, w.workout_notes, 
           e.exercise_name, e.exercise_weight, e.reps, e.sets, e.rest_between_sets, e.exercise_complete, e.intensity, e.exercise_notes
    FROM workouts w
    LEFT JOIN exercises e ON w.workout_id = e.workout_id
  `);

  const workouts = {};
  data.rows.forEach((row) => {
    if (!workouts[row.workout_id]) {
      workouts[row.workout_id] = {
        workout_id: row.workout_id,
        workout_date: row.workout_date,
        workout_notes: row.workout_notes,
        exercises: [],
      };
    }
    workouts[row.workout_id].exercises.push({
      exercise_name: row.exercise_name,
      exercise_weight: row.exercise_weight,
      reps: row.reps,
      sets: row.sets,
      rest_between_sets: row.rest_between_sets,
      exercise_complete: row.exercise_complete,
      intensity: row.intensity,
      exercise_notes: row.exercise_notes,
    });
  });

  const csvData = Object.values(workouts).map((workout) => {
    const exerciseColumns = workout.exercises.reduce((acc, exercise, index) => {
      acc[`exercise_name_${index + 1}`] = exercise.exercise_name;
      acc[`exercise_weight_${index + 1}`] = exercise.exercise_weight;
      acc[`reps_${index + 1}`] = exercise.reps;
      acc[`sets_${index + 1}`] = exercise.sets;
      acc[`rest_between_sets_${index + 1}`] = exercise.rest_between_sets;
      acc[`exercise_complete_${index + 1}`] = exercise.exercise_complete;
      acc[`intensity_${index + 1}`] = exercise.intensity;
      acc[`exercise_notes_${index + 1}`] = exercise.exercise_notes;
      return acc;
    }, {});
    return { ...workout, ...exerciseColumns };
  });

  const header = Object.keys(csvData[0]);

  const csvWriter = createObjectCsvWriter({
    path: "workout_data.csv",
    header: header,
  });

  csvWriter
    .writeRecords(csvData)
    .then(() => {
      res.download(filePath);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Error export data to csv" });
    });
});

router.get("/pdf", async (req, res) => {
  const data = await db.query(`
    SELECT w.workout_id, w.workout_date, w.workout_notes, 
           e.exercise_name, e.exercise_weight, e.reps, e.sets, e.rest_between_sets, e.exercise_complete, e.intensity, e.exercise_notes
    FROM workouts w
    LEFT JOIN exercises e ON w.workout_id = e.workout_id
  `);

  const workouts = {};
  data.rows.forEach((row) => {
    if (!workouts[row.workout_id]) {
      workouts[row.workout_id] = {
        workout_id: row.workout_id,
        workout_date: row.workout_date,
        workout_notes: row.workout_notes,
        exercises: [],
      };
    }
    workouts[row.workout_id].exercises.push({
      exercise_name: row.exercise_name,
      exercise_weight: row.exercise_weight,
      reps: row.reps,
      sets: row.sets,
      rest_between_sets: row.rest_between_sets,
      exercise_complete: row.exercise_complete,
      intensity: row.intensity,
      exercise_notes: row.exercise_notes,
    });
  });

  const pdfData = Object.values(workouts).map((workout) => {
    const exerciseColumns = workout.exercises.reduce((acc, exercise, index) => {
      acc[`exercise_name_${index + 1}`] = exercise.exercise_name;
      acc[`exercise_weight_${index + 1}`] = exercise.exercise_weight;
      acc[`reps_${index + 1}`] = exercise.reps;
      acc[`sets_${index + 1}`] = exercise.sets;
      acc[`rest_between_sets_${index + 1}`] = exercise.rest_between_sets;
      acc[`exercise_complete_${index + 1}`] = exercise.exercise_complete;
      acc[`intensity_${index + 1}`] = exercise.intensity;
      acc[`exercise_notes_${index + 1}`] = exercise.exercise_notes;
      return acc;
    }, {});
    return { ...workout, ...exerciseColumns };
  });

  const doc = new PDFDocument();
  const filePath = `${__dirname}/workout_data.pdf`;
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  doc.fontSize(25).text("Workout Data", { align: "center" });
  doc.moveDown();

  pdfData.forEach((row, i) => {
    Object.keys(row).forEach((key) => {
      doc.fontSize(12).text(`${key}: ${row[key]}`, { align: "left" });
      doc.moveDown();
    });
    doc.moveDown();
  });

  doc.end();

  writeStream.on("finish", () => {
    res.download(filePath);
  });
});

// Post data

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
