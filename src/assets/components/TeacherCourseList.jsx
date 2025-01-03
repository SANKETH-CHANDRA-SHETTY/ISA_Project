import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
// import "./TeacherCourseList.css";

const TeacherCourseList = () => {
  const [teacherCourses, setTeacherCourses] = useState([]);
  const navigate = useNavigate();
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);

  const semesterId = queryParams.get("semesterId");
  const divisionId = queryParams.get("divisionId");

  // Log semesterId and divisionId to check if they're correctly being extracted
  console.log("semesterId:", semesterId, "divisionId:", divisionId);

  useEffect(() => {
    if (semesterId && divisionId) {
      // Log the API request URL to check if the full URL is being constructed correctly
      const apiUrl = `http://localhost:8000/api/teacher_courses?semesterId=${semesterId}&divisionId=${divisionId}`;
      console.log("Fetching from API:", apiUrl);

      axios
        .get(apiUrl)
        .then((response) => {
          // Log the response to check if we are receiving the data
          console.log("Teacher Courses:", response.data);
          setTeacherCourses(response.data);
        })
        .catch((error) => {
          // Log any errors
          console.error("Error fetching teacher courses:", error);
        });
    } else {
      // Log if semesterId or divisionId is missing
      console.log("Missing semesterId or divisionId");
    }
  }, [semesterId, divisionId]);

  const handleViewExamSections = (teacherCourseId, teacherName, courseName) => {
    navigate(
      `/requirements?teacherCourseId=${teacherCourseId}&teacherName=${encodeURIComponent(
        teacherName
      )}&courseName=${encodeURIComponent(courseName)}`
    );
  };

  const handleGoBack = () => {
    navigate(-1); // Navigates to the previous page
  };

  return (
    <div className="section">
      <h2>Teachers and Courses</h2>
      <table>
        <thead>
          <tr>
            <th>Teacher</th>
            <th>Course</th>
            <th>Course Code</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {teacherCourses.length === 0 ? (
            <tr>
              <td colSpan="4">No teacher courses found.</td>
            </tr>
          ) : (
            teacherCourses.map((item) => (
              <tr key={item.teacher_course_id}>
                <td>{item.teacher_name}</td>
                <td>{item.course_name}</td>
                <td>{item.course_code}</td>
                <td>
                  <button
                    onClick={() =>
                      handleViewExamSections(
                        item.teacher_course_id,
                        item.teacher_name,
                        item.course_name
                      )
                    }
                  >
                    View Exam Sections
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <button className="back-button" onClick={handleGoBack}>
        Back
      </button>
    </div>
  );
};

export default TeacherCourseList;
