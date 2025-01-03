import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./assets/components/login.jsx";
import Faculty from "./assets/components/faculty.jsx";
import Admin from "./assets/components/admin.jsx";
import Sample from "./assets/components/sample.jsx";
import Team3 from "./assets/components/team3.jsx";
import App3 from "./assets/components/team3/App3.jsx";
import SemesterDivisionSelector from "./assets/components/SemesterDivisionSelector";
import TeacherCourseList from "./assets/components/TeacherCourseList";
import Requirements from "./assets/components/Requirements";
import App5 from "./assets/components/team5/App5.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/faculty" element={<Faculty />} />
        <Route
          path="/semester-division-selector"
          element={<SemesterDivisionSelector />}
        />
        <Route path="/teacher-courses" element={<TeacherCourseList />} />
        <Route path="/requirements" element={<Requirements />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/team3" element={<Team3 />} />
        <Route path="/team3/app3" element={<App3 />} />
        <Route path="/Sample" element={<Sample />} />
        <Route path="/team5" element={<App5 />} />
      </Routes>
    </Router>
  );
}

export default App;
