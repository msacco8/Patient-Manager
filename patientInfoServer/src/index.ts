import dotenv from "dotenv";
import express, { Application, Request, Response } from "express";
import mongoose, { ObjectId } from "mongoose";
import fs from "fs";
import path from "path";
import PatientModel from "./models/patient";

dotenv.config();

const cors = require("cors");

const app: Application = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const formatDate = (date: Date) => {
  let d = new Date(date),
    month = "" + (d.getMonth() + 1), // getMonth() returns months from 0-11
    day = "" + d.getDate(),
    year = d.getFullYear();

  // Pad single digit month and day with a zero
  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

// Function to load data from JSON file and insert into MongoDB
const loadDataFromJson = async () => {
  try {
    // Check if the database already has patient data
    const count = await PatientModel.countDocuments();
    if (count == 10000) {
      console.log(`There are ${count} patients`);
      console.log("Database already has patient data. Skipping data load.");
      return; // Exit the function if data already exists
    }

    await PatientModel.deleteMany();

    const filePath = path.join(__dirname, "data", "patient_data.json");
    const jsonData = fs.readFileSync(filePath, "utf-8");
    const patients = JSON.parse(jsonData);

    // Insert data into MongoDB
    let id = 0;
    for (const patient of patients) {
      const newPatient = new PatientModel({ ...patient, id });
      await newPatient.save();
      id += 1;
    }

    console.log("Patient data loaded successfully");
  } catch (err) {
    console.error("Error loading patient data from JSON", err);
  }
};

mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log("Connected to MongoDB");
    loadDataFromJson(); // Call the function to load data after successful connection
  })
  .catch((err) => console.error("Could not connect to MongoDB", err));

app.get("/", async (req: Request, res: Response) => {
  const count = await PatientModel.countDocuments();
  if (count) {
    res.json(count);
  }
});

// Get patient by ID - change later
app.get("/patients/:id", async (req: Request, res: Response) => {
  const patientId = parseInt(req.params.id); // Convert ID from string to number
  if (isNaN(patientId)) {
    return res.status(400).send("Invalid patient ID format");
  }
  try {
    const { id } = req.params;
    const patient = await PatientModel.findOne({ id: patientId });

    if (patient) {
      res.json(patient);
    } else {
      res.status(404).send("Patient not found");
    }
  } catch (error) {
    console.error("Error fetching patient:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Pagination dropdown route
app.get("/patients", async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.size as string) || 10;

  try {
    const totalItems = await PatientModel.countDocuments();
    const patients = await PatientModel.find()
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    const totalPages = Math.ceil(totalItems / pageSize);
    res.json({
      patients,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Failed to fetch items:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/medication", async (req, res) => {
  const { patientId, _id, name, dosage, start_date, end_date, dates_taken } = req.body;
  if (isNaN(patientId)) {
    return res.status(400).send("Invalid patient ID format");
  }
  try {
    const patient = await PatientModel.findOne({ id: patientId });
    if (patient) {
      // Check if the medications array contains an element with the specified name and dosage
      const existingMedication = patient.medications.some((medication) => medication._id.toString() === _id);
      if (existingMedication) {
        const index = patient.medications.findIndex((medication) => medication._id.toString() === _id);
        if (index !== -1) {
          patient.medications[index] = { _id, name, dosage, start_date, end_date, dates_taken };
          await patient.save(); // Save the updated patient document
          res.status(200).json({ message: "Medication updated", data: patient.medications });
        }
      } else {
        // Medication does not exist, add a new one
        patient.medications.push({
          _id: new mongoose.Types.ObjectId(),
          name,
          dosage,
          start_date,
          end_date,
          dates_taken,
        });
        await patient.save();
        res.status(201).json({ message: "Medication added", data: patient.medications });
      }
    } else {
      // Handle the case where no patient is found
      res.status(404).json({ message: "Patient not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error: error });
  }
});

app.post("/temperature", async (req, res) => {
  const { patientId, date, temperature, lastModified } = req.body;
  const today = formatDate(new Date());

  try {
    const patient = await PatientModel.findOne({ id: patientId });
    if (patient) {
      // Check if the temperature array contains an element with the specified date
      const existingTemperature = patient.body_temperatures.some((temperature) => temperature.date === date);

      if (existingTemperature) {
        const index = patient.body_temperatures.findIndex((temperature) => temperature.date === date);
        if (index !== -1) {
          patient.body_temperatures[index] = { date, temperature, lastModified: today };
          await patient.save(); // Save the updated patient document
          res.status(200).json({ message: "Temperature updated", data: patient.body_temperatures[index] });
        }
      } else if (lastModified !== today) {
        // Medication does not exist, add a new one
        patient.body_temperatures.push({ date, temperature, lastModified: today });
        await patient.save();
        res.status(201).json({ message: "Temperature added", data: patient });
      } else {
        res.status(201).json({ message: "Temperature already added/modified today", data: patient });
      }
    } else {
      // Handle the case where no patient is found
      res.status(404).json({ message: "Patient not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error: error });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
