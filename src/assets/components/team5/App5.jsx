import React from "react";
import { useLocation } from "react-router-dom";
import AbsenteeEntries from "./Components/Attendence_Booklet";

function App() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const rollNumbers = queryParams.get("rollNo") || ""; // Default to an empty string if missing
  const classid = queryParams.get("classid") || ""; // Default to an empty string if missing
  const subjectName = queryParams.get("subject") || ""; // Default to an empty string if missing

  return (
    <AbsenteeEntries
      RollNumbers={rollNumbers}
      classid={classid}
      SubjectName={subjectName}
    />
  );
}

export default App;
