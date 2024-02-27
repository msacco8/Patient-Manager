import mongoose, { MongooseError } from "mongoose";

interface Medication {
  _id: mongoose.Types.ObjectId;
  name: String;
  dosage: String;
  start_date: String;
  end_date: String;
  dates_taken: [String];
}

interface Temperature {
  date: String;
  temperature: Number;
  lastModified: String;
}

const MedicationSchema = new mongoose.Schema<Medication>({
  _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  name: String,
  dosage: String,
  start_date: String,
  end_date: String,
  dates_taken: { type: [String], default: [] },
});

const TemperatureSchema = new mongoose.Schema<Temperature>({
  date: String,
  temperature: Number,
  lastModified: { type: String, default: null },
});

interface Patient {
  id: Number;
  name: String;
  first_name: String;
  age: Number;
  height: Number;
  weight: Number;
  gender: String;
  medications: Medication[];
  body_temperatures: Temperature[];
}

const patientSchema = new mongoose.Schema<Patient>({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  first_name: { type: String, required: true },
  age: { type: Number, required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  gender: { type: String, required: true },
  medications: { type: [MedicationSchema], required: true },
  body_temperatures: { type: [TemperatureSchema], required: true },
});

const PatientModel = mongoose.model<Patient>("Patient", patientSchema);

export default PatientModel;
