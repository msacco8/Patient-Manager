import "./Actions.css";
import { Medication, Patient, formatDate } from "../../App";
import { useEffect, useState } from "react";

interface ActionsProps {
  patientData: Patient | null;
}
const Actions: React.FC<ActionsProps> = ({ patientData }) => {
  const [date, setDate] = useState<string>(formatDate(new Date()));

  useEffect(() => {
    setDate(formatDate(new Date()));
  }, []);

  const temperatureTakenToday = () => {
    return patientData?.body_temperatures.find((temp) => temp.date == date);
  };

  const medicationTakenToday = (medication: Medication) => {
    return medication.dates_taken.find((medDate: string) => medDate == date);
  };
  return (
    <div className="actionsContainer">
      <div className="actionsHeader">
        <h3>Actions</h3>
      </div>
      <div className="actionsList">
        <ul>
          <li style={{ textDecoration: temperatureTakenToday() ? "line-through" : "none" }}>
            Take today's temperature
          </li>
          <li>
            Administer medications
            {patientData && patientData.medications.length > 0 && (
              <ul>
                {patientData.medications.map((medication, index) => (
                  <li
                    key={index}
                    style={{ textDecoration: medicationTakenToday(medication) ? "line-through" : "none" }}
                  >
                    {medication.name}
                  </li>
                ))}
              </ul>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Actions;
