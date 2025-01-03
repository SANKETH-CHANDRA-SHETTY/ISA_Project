import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import "./SemesterDivisionSelector.css";

const SemesterDivisionSelector = () => {
  const [semesters, setSemesters] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch semesters from backend
    axios
      .get("http://localhost:8000/semesters")
      .then((response) => setSemesters(response.data))
      .catch((err) => console.error("Error fetching semesters: ", err));
  }, []);

  const handleSemesterChange = (e) => {
    const semesterId = e.target.value;
    setSelectedSemester(semesterId);
    if (semesterId) {
      // Fetch divisions for selected semester
      axios
        .get(`http://localhost:8000/divisions/${semesterId}`)
        .then((response) => setDivisions(response.data))
        .catch((err) => console.error("Error fetching divisions: ", err));
    } else {
      setDivisions([]);
    }
  };

  const handleShowTeachers = () => {
    if (selectedSemester && selectedDivision) {
      navigate(
        `/teacher-courses?semesterId=${selectedSemester}&divisionId=${selectedDivision}`
      );
    } else {
      alert("Please select both a semester and a division.");
    }
  };
  const handleGoBack = () => {
    navigate(-1); // Navigate to the previous page
  };

  return (
    <>
      <h1>ISA Management System</h1>
      <div className="section">
        <h2>Select Semester and Division</h2>
        <label htmlFor="semester">Semester:</label>
        <select
          id="semester"
          onChange={handleSemesterChange}
          value={selectedSemester}
        >
          <option value="">Select Semester</option>
          {semesters.map((semester) => (
            <option key={semester.semester_id} value={semester.semester_id}>
              {semester.semester_name}
            </option>
          ))}
        </select>

        <label htmlFor="division">Division:</label>
        <select
          id="division"
          onChange={(e) => setSelectedDivision(e.target.value)}
          value={selectedDivision}
        >
          <option value="">Select Division</option>
          {divisions.map((division) => (
            <option key={division.division_id} value={division.division_id}>
              {division.division_name}
            </option>
          ))}
        </select>

        <button onClick={handleShowTeachers}>Show Teachers</button>
        <button onClick={handleGoBack} style={{ marginLeft: "10px" }}>
          Go Back
        </button>
      </div>
    </>
  );
};

export default SemesterDivisionSelector;
