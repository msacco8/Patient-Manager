import React, { useState, useEffect } from "react";
import { Patient } from "../../App";
import "./Sidebar.css";

interface SidebarProps {
  setPatientId: (id: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ setPatientId }) => {
  const [currentPatients, setCurrentPatients] = useState<Patient[]>([]); // For storing fetched items
  const [currentPage, setCurrentPage] = useState(1); // Current page in pagination
  const [pageSize] = useState(10); // Number of items per page
  const [totalPages, setTotalPages] = useState(0); // Total number of pages

  useEffect(() => {
    const fetchItems = async () => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/patients?page=${currentPage}&size=${pageSize}`);
      const patientPageData = await response.json();
      setCurrentPatients(patientPageData.patients);
      setTotalPages(patientPageData.pagination.totalPages);
    };

    fetchItems();
  }, [currentPage, pageSize]);

  return (
    <div className="sideBarContainer">
      <div className="sideBarHeader">
        <b>Current Patients</b>
      </div>
      <div className="sideBarList">
        {currentPatients.map((patient) => (
          <div key={patient.id.toString()} className="sideBarItem" onClick={() => setPatientId(patient.id)}>
            {patient.name}
          </div>
        ))}
      </div>
      <div className="paginationControls">
        <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
          Prev
        </button>
        <span style={{ marginLeft: "4px", marginRight: "4px" }}>
          {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
