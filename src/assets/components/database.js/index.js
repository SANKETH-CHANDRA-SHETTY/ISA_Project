const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Database Connection
const db = mysql.createConnection({
  host: "127.0.0.1", // Change if not local
  user: "root", // Your MySQL username
  password: "", // Your MySQL password
  database: "assessment", // Your database name
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err.message);
  } else {
    console.log("Connected to MySQL database!");
  }
});

// API Endpoints
app.get("/semesters", (req, res) => {
  db.query("SELECT * FROM semesters", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.get("/divisions/:semesterId", (req, res) => {
  const { semesterId } = req.params;
  console.log("Request received for semesterId:", semesterId); // Debug log

  db.query(
    "SELECT * FROM divisions WHERE semester_id = ?",
    [semesterId],
    (err, results) => {
      if (err) {
        console.error("Error fetching divisions:", err.message);
        return res.status(500).send("Error fetching divisions");
      }
      res.json(results);
    }
  );
});

// API to get Teachers and Courses for a given semester and division
app.get("/api/teacher_courses", (req, res) => {
  const { semesterId, divisionId } = req.query; // Fetching query parameters

  // Ensure both semesterId and divisionId are present
  if (!semesterId || !divisionId) {
    return res.status(400).send("Missing semesterId or divisionId");
  }

  // SQL query to fetch teachers and courses based on semesterId and divisionId
  db.query(
    `
        SELECT 
            tc.teacher_course_id,
            t.teacher_name,
            c.course_name,
            c.course_code,
            d.division_name
        FROM 
            TeacherCourses tc
        INNER JOIN 
            Teachers t ON tc.teacher_id = t.teacher_id
        INNER JOIN 
            Courses c ON tc.course_id = c.course_id
        INNER JOIN 
            Divisions d ON tc.division_id = d.division_id
        WHERE 
            tc.semester_id = ? AND tc.division_id = ?
      `,
    [semesterId, divisionId],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error fetching teacher courses");
      }

      // Send the results as a response
      res.json(rows);
    }
  );
});

app.get("/api/exam_sections", async (req, res) => {
  const { teacherCourseId } = req.query;

  if (!teacherCourseId) {
    console.warn("Missing teacherCourseId in query parameters");
    return res.status(400).send("teacherCourseId is required");
  }

  db.query(
    `
        SELECT 
            es.exam_section_name, 
            ses.student_count
        FROM 
            StudentExamSections ses
        INNER JOIN 
            ExamSections es ON ses.exam_section_id = es.exam_section_id
        WHERE 
            ses.teacher_course_id = ?
      `,
    [teacherCourseId],
    (err, rows) => {
      if (err) {
        console.error("Error fetching exam sections:", err);
        return res.status(500).send("Error fetching exam sections");
      }

      if (rows.length === 0) {
        console.warn(
          `No exam sections found for teacherCourseId: ${teacherCourseId}`
        );
      }

      res.json(rows);
    }
  );
});

// Start Server
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
