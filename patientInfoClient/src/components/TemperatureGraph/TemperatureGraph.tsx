import "./TemperatureGraph.css";
import { Patient, Temperature, formatDate } from "../../App";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "chartjs-adapter-date-fns";
import type { ChartData, ChartOptions } from "chart.js";

interface TemperatureProps {
  patientData: Patient | null;
  setPatientData: (arg0: Patient) => void;
}

interface ModalProps {
  closeModal: () => void;
  patientId: string;
  patientData: Patient | null;
  setPatientData: (arg0: Patient) => void;
}

interface TemperatureFormData {
  patientId: string;
  _id: string;
  date: string;
  temperature: string;
}

// Modal component
const ModalForm: React.FC<ModalProps> = ({ closeModal, setPatientData, patientData, patientId }) => {
  const [formData, setFormData] = useState<TemperatureFormData>({
    patientId: patientId,
    _id: "",
    date: formatDate(new Date()),
    temperature: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  // Hit post api to update temperature data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/temperature`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setPatientData({ ...patientData!, body_temperatures: data.data.body_temperatures });
        closeModal();
        console.log("Success:", data);
      } else {
        console.error("Error:", data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const modifiedToday = patientData?.body_temperatures.some(
    (temp) => temp.date == formData.date && temp.lastModified == formData.date
  );

  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <div className="formHeader">
          <p>Add Today's Temperature</p>
          <button onClick={closeModal}>Close</button>
        </div>
        <div className="formContainer">
          <form>
            <div className="formGroup">
              <label htmlFor="temperature">Temperature (ºC):</label>
              <input
                name="temperature"
                disabled={modifiedToday}
                value={!modifiedToday ? formData.temperature : "You can only add a temperature once a day"}
                onChange={handleChange}
                id="medName"
                type="text"
              />
            </div>
            <div className="formGroup">
              <label htmlFor="date">Date</label>
              <input name="date" disabled={true} value={formData.date} onChange={handleChange} id="date" type="text" />
            </div>
            <div className="formGroup formButton">
              <button disabled={modifiedToday} onClick={handleSubmit} type="submit">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const TemperatureGraph: React.FC<TemperatureProps> = ({ patientData, setPatientData }) => {
  const [dates, setDates] = useState<string[]>([]);
  const [timeScale, setTimeScale] = useState<number>(1);
  const [temperatures, setTemperatures] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  // Get closest date for determining the scale of X axis
  const findClosestDate = (temperatures: Temperature[]) => {
    const now = new Date();
    let closestDate: Date | null = null;
    let smallestDiff = Infinity;

    temperatures.forEach((temp) => {
      const tempDate = new Date(temp.date);
      const diff = Math.abs(now.getTime() - tempDate.getTime());

      if (diff < smallestDiff) {
        closestDate = tempDate;
        smallestDiff = diff;
      }
    });

    return closestDate ? closestDate : now;
  };

  // Extract dates and temperatures into separate arrays
  useEffect(() => {
    if (patientData) {
      const nearestDate = findClosestDate(patientData.body_temperatures);
      const cutoffDate = new Date(nearestDate.setMonth(nearestDate.getMonth() - timeScale));

      const filteredTemperatures = patientData.body_temperatures.filter((tempItem) => {
        const tempDate = new Date(tempItem.date);
        return tempDate >= cutoffDate;
      });
      const extractedDates = filteredTemperatures.map((tempItem) => tempItem.date);
      const extractedTemperatures = filteredTemperatures.map((tempItem) => tempItem.temperature);

      setDates(extractedDates);
      setTemperatures(extractedTemperatures);
    }
  }, [patientData, timeScale]);

  const data: ChartData<"line"> = {
    labels: dates,
    datasets: [
      {
        label: `Temperatures`,
        data: temperatures,
        fill: false,
        backgroundColor: "rgb(75, 192, 192)",
        borderColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    scales: {
      x: {
        type: "time",
        time: {
          unit: "month",
          tooltipFormat: "yyyy/mm/dd",
          displayFormats: {
            day: "yyyy/mm/dd",
          },
        },
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: "Temperature (celsius)",
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `${patientData?.first_name + " " + patientData?.name} Body Temperatures`,
      },
    },
  };

  return (
    <div className="tempContainer">
      <div className="buttonContainer">
        <select value={timeScale} onChange={(e) => setTimeScale(Number(e.target.value))}>
          <option value={1}>1 Month</option>
          <option value={3}>3 Months</option>
          <option value={6}>6 Months</option>
        </select>
        <button onClick={toggleModal}>Add Temperature +</button>
      </div>
      <div className="graphContainer">
        <Line data={data} options={options} />
      </div>
      {isModalOpen && (
        <ModalForm
          setPatientData={setPatientData}
          patientData={patientData}
          patientId={patientData!.id.toString()}
          closeModal={toggleModal}
        />
      )}
    </div>
  );
};

export default TemperatureGraph;
