// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useLocation, useNavigate } from "react-router-dom";
// // import "./Requirements.css"; // Import the CSS file
// const Requirements = () => {
//   const [examSections, setExamSections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const { search } = useLocation();
//   const navigate = useNavigate();

//   const queryParams = new URLSearchParams(search);
//   const teacherCourseId = queryParams.get("teacherCourseId");
//   const teacherName = queryParams.get("teacherName");
//   const courseName = queryParams.get("courseName");

//   useEffect(() => {
//     if (teacherCourseId) {
//       setLoading(true);
//       axios
//         .get(
//           `http://localhost:8000/api/exam_sections?teacherCourseId=${teacherCourseId}`
//         )
//         .then((response) => {
//           console.log("Exam sections data:", response.data); // Debug the response
//           setExamSections(response.data);
//           setLoading(false);
//         })
//         .catch((error) => {
//           console.error("Error fetching exam sections:", error);
//           setError("Failed to fetch exam sections.");
//           setLoading(false);
//         });
//     } else {
//       console.error("Invalid teacherCourseId:", teacherCourseId);
//       setError("Invalid teacherCourseId.");
//       setLoading(false);
//     }
//   }, [teacherCourseId]);

//   return (
//     <div className="content-container">
//       <h1>Question Paper Requirements</h1>
//       <h2>
//         Teacher: {teacherName} - Course: {courseName}
//       </h2>

//       {loading ? (
//         <p>Loading exam sections...</p>
//       ) : error ? (
//         <p>{error}</p>
//       ) : (
//         <table>
//           <thead>
//             <tr>
//               <th>Exam Section</th>
//               <th>Student Count</th>
//             </tr>
//           </thead>
//           <tbody>
//             {examSections.length > 0 ? (
//               examSections.map((section, index) => (
//                 <tr key={index}>
//                   <td>{section.exam_section_name}</td>
//                   <td>{section.student_count}</td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="2">No exam sections found.</td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       )}

//       <button onClick={() => navigate(-1)}>Go Back</button>
//     </div>
//   );
// };

// export default Requirements;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
// import "./Requirements.css"; // Import the CSS file
const Requirements = () => {
  const [examSections, setExamSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { search } = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(search);
  const teacherCourseId = queryParams.get("teacherCourseId");
  const teacherName = queryParams.get("teacherName");
  const courseName = queryParams.get("courseName");

  useEffect(() => {
    if (courseName) {
      setLoading(true);
      axios
        .get(
          `http://localhost:8000/api/fetch_course_table?courseName=${courseName}`
        )
        .then((response) => {
          console.log("Table data:", response.data); // Debug the response
          setExamSections(response.data); // Assuming response contains the table rows
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching table data:", error);
          setError("Failed to fetch table data.");
          setLoading(false);
        });
    } else {
      console.error("Invalid courseName:", courseName);
      setError("Invalid courseName.");
      setLoading(false);
    }
  }, [courseName]);

  return (
    <div className="content-container">
      <h1>Question Paper Requirements</h1>
      <h2>
        Teacher: {teacherName} - Course: {courseName}
      </h2>

      {loading ? (
        <p>Loading exam sections...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        // <table>
        //   <thead>
        //     <tr>
        //       <th>Exam Section</th>
        //       <th>Student Count</th>
        //     </tr>
        //   </thead>
        //   <tbody>
        //     {examSections.length > 0 ? (
        //       examSections.map((section, index) => (
        //         <tr key={index}>
        //           <td>{section.exam_section_name}</td>
        //           <td>{section.student_count}</td>
        //         </tr>
        //       ))
        //     ) : (
        //       <tr>
        //         <td colSpan="2">No exam sections found.</td>
        //       </tr>
        //     )}
        //   </tbody>
        // </table>
        <table>
          <thead>
            <tr>
              <th>Class ID</th>
              <th>Question Paper Count</th>
            </tr>
          </thead>
          <tbody>
            {examSections.length > 0 ? (
              examSections.map((section, index) => {
                // Split and filter RollNumbers
                const rollNumbers = section.RollNumbers.split(", ")
                  .map((num) => parseInt(num, 10)) // Convert to integers
                  .filter((num) => num < 200); // Filter numbers < 200
                const rollNumberCount = rollNumbers.length; // Count the valid roll numbers

                return (
                  <tr key={index}>
                    <td>{section.classid}</td>
                    <td>{rollNumberCount}</td> {/* Display the count */}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="3">No data found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <button onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );
};

export default Requirements;
