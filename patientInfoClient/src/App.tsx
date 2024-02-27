import { useState, useEffect } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar/Sidebar";
import BasicInfo from "./components/BasicInfo/BasicInfo";
import Actions from "./components/Actions/Actions";
import Medications from "./components/Medication/Medication";
import TemperatureGraph from "./components/TemperatureGraph/TemperatureGraph";

export interface Medication {
  _id: string;
  name: string;
  dosage: string;
  start_date: string;
  end_date: string;
  dates_taken: [string];
}

export interface Temperature {
  date: string;
  temperature: number;
  lastModified: string;
}

export interface Patient {
  id: number;
  name: String;
  first_name: String;
  age: number;
  height: number;
  weight: number;
  gender: String;
  medications: Medication[];
  body_temperatures: Temperature[];
}

export function formatDate(date: Date) {
  let d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

function App() {
  const [patientId, setPatientId] = useState<number>(0);
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);

  const fetchPatientData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/patients/${patientId}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const patientData = await response.json();
      setPatientData(patientData);
    } catch (error) {
      console.error("Failed to fetch patient data:", error);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, [patientId]);

  return (
    <div className="dashboardContainer">
      <div className="sideBar">
        <Sidebar setPatientId={setPatientId} />
      </div>
      <div className="mainContent">
        <BasicInfo patientData={patientData} />
        {patientData && (
          <>
            <div className="middleContent">
              <Actions patientData={patientData} />
              <TemperatureGraph setPatientData={setPatientData} patientData={patientData} />
            </div>
            <Medications
              setPatientData={setPatientData}
              isMedModalOpen={isMedModalOpen}
              setIsMedModalOpen={setIsMedModalOpen}
              patientData={patientData}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
