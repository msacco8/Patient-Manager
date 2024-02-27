import { Patient } from "../../App";
import "./BasicInfo.css";

interface BasicInfoProps {
  patientData: Patient | null;
}

const BasicInfo: React.FC<BasicInfoProps> = ({ patientData }) => {
  return (
    <div className="infoContainer">
      {patientData ? (
        <>
          <div className="nameField">
            <b>
              {patientData.name}, {patientData.first_name}
            </b>
          </div>
          <div className="dataContainer">
            <div className="dataField">Age: {patientData.age.toString()}</div>
            <div className="dataField">Height: {patientData.height.toString()} cm</div>
            <div className="dataField">Weight: {patientData.weight.toString()} kg</div>
            <div className="dataField">Gender: {patientData.gender}</div>
          </div>
        </>
      ) : (
        <div className="nameField">Please select a patient</div>
      )}
    </div>
  );
};

export default BasicInfo;
