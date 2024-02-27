import "./Medication.css";
import { Patient, Medication, formatDate } from "../../App";
import React, { useState } from "react";

interface MedicationProps {
  patientData: Patient | null;
  setPatientData: (arg0: Patient) => void;
  isMedModalOpen: boolean;
  setIsMedModalOpen: (arg0: boolean) => void;
}

interface ModalProps {
  closeModal: () => void;
  patientId: string;
  medication: Medication | null;
  patientData: Patient | null;
  setPatientData: (arg0: Patient) => void;
}

interface MedicationFormData {
  patientId: string;
  _id: string;
  name: string;
  dosage: string;
  start_date: string;
  end_date: string;
  dates_taken: string[];
}

const ModalForm: React.FC<ModalProps> = ({ patientData, setPatientData, closeModal, patientId, medication }) => {
  const [formData, setFormData] = useState<MedicationFormData>(
    medication
      ? {
          patientId: patientId,
          _id: medication._id,
          name: medication.name,
          dosage: medication.dosage,
          start_date: medication.start_date ? medication.start_date : "",
          end_date: medication.end_date ? medication.end_date : "",
          dates_taken: medication.dates_taken,
        }
      : {
          patientId: patientId,
          _id: "",
          name: "",
          dosage: "",
          start_date: "",
          end_date: "",
          dates_taken: [],
        }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/medication`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setPatientData({ ...patientData!, medications: data.data });
        closeModal();
        console.log("Success:", data);
      } else {
        console.error("Error:", data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <div className="formHeader">
          <p>Add New Medication</p>
          <button onClick={closeModal}>Close</button>
        </div>
        <div className="formContainer">
          <form>
            <div className="formGroup">
              <label htmlFor="medName">Medication Name:</label>
              <input name="name" value={formData.name} onChange={handleChange} id="medName" type="text" />
            </div>
            <div className="formGroup">
              <label htmlFor="medDosage">Dosage:</label>
              <input name="dosage" value={formData.dosage} onChange={handleChange} id="medDosage" type="text" />
            </div>
            <div className="formGroup">
              <label htmlFor="medStart">Start Date:</label>
              <input name="start_date" value={formData.start_date} onChange={handleChange} id="medStart" type="date" />
            </div>
            <div className="formGroup">
              <label htmlFor="medEnd">End Date:</label>
              <input name="end_date" value={formData.end_date} onChange={handleChange} id="medEnd" type="date" />
            </div>
            <div className="formGroup formButton">
              <button onClick={handleSubmit} type="submit">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

interface MedicationCardProps {
  setEditingMedication: (arg0: Medication | null) => void;
  setIsMedModalOpen: (arg0: boolean) => void;
  isMedModalOpen: boolean;
  medication: Medication;
  patientId: string;
  patientData: Patient | null;
  setPatientData: (args0: Patient) => void;
}

const MedicationCard: React.FC<MedicationCardProps> = ({
  patientData,
  setPatientData,
  medication,
  patientId,
  setIsMedModalOpen,
  isMedModalOpen,
  setEditingMedication,
}) => {
  const [takenToday, setTakenToday] = useState<boolean>(medication.dates_taken.includes(formatDate(new Date())));
  const handleEdit = async () => {
    setIsMedModalOpen(!isMedModalOpen);
    setEditingMedication(medication);
  };
  const updateTaken = async () => {
    try {
      const newDatesTaken = !takenToday
        ? [...medication.dates_taken, formatDate(new Date())]
        : medication.dates_taken.filter((date) => date !== formatDate(new Date()));
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/medication`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId,
          ...medication,
          dates_taken: newDatesTaken,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setTakenToday(!takenToday);
        setPatientData({ ...patientData!, medications: data.data });
        console.log("Success:", data);
      } else {
        console.error("Error:", data);
      }
      setEditingMedication(null);
    } catch (error) {
      setEditingMedication(null);
      console.error("Error:", error);
    }
  };

  return (
    <div key={`medication-${medication.name}-${medication.dosage}`} className="medicationCard">
      <div className="medInfo">
        <p>
          <b>{medication.name}</b>
        </p>
        <p>Dose: {medication.dosage}</p>
      </div>
      <div className="medDateInfo">
        <p>
          <b>Start:</b> {medication.start_date ? medication.start_date : "N/A"}
        </p>
        <p>
          <b>End:</b> {medication.end_date ? medication.end_date : "N/A"}
        </p>
      </div>
      <div className="takenDiv">
        <div>
          <b>Taken Today?</b>
        </div>
        <div
          style={{ backgroundColor: takenToday ? "grey" : "white" }}
          onClick={updateTaken}
          className="medCheckBox"
        ></div>
      </div>

      <div className="medEditDiv">
        <button onClick={handleEdit} className="modifyMedButton">
          Edit
        </button>
      </div>
    </div>
  );
};

const Medications: React.FC<MedicationProps> = ({ setPatientData, patientData, setIsMedModalOpen, isMedModalOpen }) => {
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const toggleModal = () => setIsMedModalOpen(!isMedModalOpen);

  return (
    <div className="medicationContainer">
      <div className="medicationHeader">
        <button className="addMedButton" onClick={toggleModal}>
          Add Medication +
        </button>
      </div>
      <div className="cardContainer">
        {patientData &&
          patientData.medications.map((medication, index) => {
            return (
              <MedicationCard
                patientData={patientData}
                setPatientData={setPatientData}
                isMedModalOpen={isMedModalOpen}
                setIsMedModalOpen={setIsMedModalOpen}
                setEditingMedication={setEditingMedication}
                patientId={patientData!.id.toString()}
                key={`medication-${index}`}
                medication={medication}
              />
            );
          })}
      </div>

      {isMedModalOpen && (
        <ModalForm
          patientData={patientData}
          medication={editingMedication}
          setPatientData={setPatientData}
          patientId={patientData!.id.toString()}
          closeModal={toggleModal}
        />
      )}
    </div>
  );
};

export default Medications;
