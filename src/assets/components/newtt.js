const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set up MySQL connection
const con = mysql.createConnection(
  {
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "assessment", // Assuming this is your database
  }
  // {
  //   host: "10.12.3.93",
  //   user: "root",
  //   password: "",
  //   database: "assessment", // Assuming this is your database
  // }
);

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected to the assessment database!");
});

app.post("/addtimetable/:tableName", (req, res) => {
  const { tableName } = req.params;
  const { date, day, time, sub_name, E_type } = req.body;

  console.log("Received data:", req.body); // Log the received data

  if (!date || !day || !time || !sub_name || !E_type) {
    return res.status(400).send("All fields are required.");
  }

  const validTables = ["timetable", "5thsem", "3rdthsem"];
  if (!validTables.includes(tableName)) {
    return res.status(400).send("Invalid table name.");
  }

  const addTimetableSql = `INSERT INTO ${tableName} (date, day, time, sub_name, E_type) VALUES (?, ?, ?, ?, ?)`;

  con.query(addTimetableSql, [date, day, time, sub_name, E_type], (err) => {
    if (err) {
      console.error(`Error adding timetable to ${tableName}:`, err);
      return res.status(500).send("Error adding timetable.");
    }

    res.send(`<h1>Timetable entry added successfully to ${tableName}!</h1>`);
  });
});

// Endpoint to get timetable data dynamically
app.get("/gettimetable/:tableName", (req, res) => {
  const { tableName } = req.params;

  // Validate table name
  const validTables = ["timetable", "5thsem", "3rdthsem"];
  if (!validTables.includes(tableName)) {
    return res.status(400).send("Invalid table name.");
  }

  const getTimetableSql = `SELECT * FROM ${tableName}`;

  con.query(getTimetableSql, (err, result) => {
    if (err) {
      console.error(`Error fetching timetable from ${tableName}:`, err);
      return res.status(500).send("Error fetching timetable.");
    }

    res.json(result);
  });
});

// Add duty allocation (duty_allote table)
app.post("/addduty/duty_allote", (req, res) => {
  const { fac_id, fac_name, day, time, sub_name, E_type } = req.body;

  // if (!fac_id || !fac_name || !day || !time || !sub_name) {
  //   return res.status(400).send("All fields are required.");
  // }

  const addDutySql = `INSERT INTO duty_allote (fac_id, fac_name, day, time, sub_name) VALUES (?, ?, ?, ?, ?)`;

  con.query(addDutySql, [fac_id, fac_name, day, time, sub_name], (err) => {
    if (err) {
      console.error("Error allocating duty:", err);
      return res.status(500).send("Error allocating duty.");
    }

    res.json({ message: "Duty allocated successfully!" });
  });
});

// Endpoint to get all allocated duties
app.get("/getduty/duty_allote", (req, res) => {
  const getDutySql = "SELECT * FROM duty_allote";

  con.query(getDutySql, (err, result) => {
    if (err) {
      console.error("Error fetching duty allocations:", err);
      return res.status(500).send("Error fetching duty allocations.");
    }

    res.json(result);
  });
});

// Add bad allocation (bad_allote table)
app.post("/addduty/bad_allote", (req, res) => {
  const { fac_id, fac_name, day, time, sub_name } = req.body;

  if (!fac_id || !fac_name || !day || !time || !sub_name) {
    return res.status(400).send("All fields are required.");
  }

  const addBadDutySql = `INSERT INTO bad_allote (fac_id, fac_name, day, time, sub_name) VALUES (?, ?, ?, ?, ?)`;

  con.query(addBadDutySql, [fac_id, fac_name, day, time, sub_name], (err) => {
    if (err) {
      console.error("Error adding bad allocation:", err);
      return res.status(500).send("Error adding bad allocation.");
    }

    res.json({ message: "Bad allocation added successfully!" });
  });
});

// Endpoint to get all bad allocations
app.get("/getduty/bad_allote", (req, res) => {
  const getBadDutySql = "SELECT * FROM bad_allote";

  con.query(getBadDutySql, (err, result) => {
    if (err) {
      console.error("Error fetching bad allocations:", err);
      return res.status(500).send("Error fetching bad allocations.");
    }

    res.json(result);
  });
});

// Update duty allocation (duty_allote table)
app.put("/updateduty/duty_allote", (req, res) => {
  const { fac_id, fac_name, day, time, sub_name } = req.body;

  if (!fac_id || !fac_name || !day || !time || !sub_name) {
    return res.status(400).send("All fields are required.");
  }

  // SQL query to update the duty allocation based on fac_id
  const updateDutySql = `
    UPDATE duty_allote
    SET fac_name = ?, day = ?, time = ?, sub_name = ?
    WHERE fac_id = ?
  `;

  con.query(
    updateDutySql,
    [fac_name, day, time, sub_name, fac_id],
    (err, result) => {
      if (err) {
        console.error("Error updating duty allocation:", err);
        return res.status(500).send("Error updating duty allocation.");
      }

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .send("Duty allocation not found for the provided faculty ID.");
      }

      res.json({ message: "Duty allocation updated successfully!" });
    }
  );
});

// Delete duty allocation from bad_allote (DELETE)
app.delete("/delete-badallote/:fac_id", (req, res) => {
  const { fac_id } = req.params;

  // SQL query to delete the record from bad_allote table
  const deleteBadDutySql = "DELETE FROM bad_allote WHERE fac_id = ?";

  con.query(deleteBadDutySql, [fac_id], (err, result) => {
    if (err) {
      console.error("Error deleting bad allocation:", err);
      return res.status(500).send("Error deleting bad allocation.");
    }

    if (result.affectedRows > 0) {
      res.send("Bad allocation deleted successfully!");
    } else {
      res.status(404).send("No record found with the given faculty ID.");
    }
  });
});

// Route to Fetch Unique Date-Time Values
app.get("/unique-values", (req, res) => {
  // Query to fetch unique date and time from all three tables
  const selectUniqueQuery = `
    SELECT DISTINCT DATE(date) AS date, time 
    FROM (
      SELECT date, time FROM 5thsem
      UNION
      SELECT date, time FROM 3rdthsem
      UNION
      SELECT date, time FROM timetable
    ) AS combined
    ORDER BY date, time;
  `;

  con.query(selectUniqueQuery, (err, uniqueResults) => {
    if (err) {
      console.error("Error retrieving unique values:", err);
      return res.status(500).send("Error retrieving unique values");
    }

    console.log("Unique Results:", uniqueResults);

    // For each unique date-time, fetch associated class data
    const promises = uniqueResults.map(({ date, time }) => {
      return new Promise((resolve, reject) => {
        const selectClassesQuery = "SELECT classname, classid FROM rooms";
        con.query(selectClassesQuery, (err, classes) => {
          if (err) reject(err);
          resolve({ date, time, classes });
        });
      });
    });

    Promise.all(promises)
      .then((data) => res.json(data))
      .catch((err) => {
        console.error("Error fetching classes:", err);
        res.status(500).send("Error fetching classes");
      });
  });
});

const formatDate = (date) => {
  // Extract the first 10 characters and remove dashes
  date =
    date.substring(0, 10).replace(/-/g, "") +
    date.substring(10).replace(/[^\w\s\T]/g, "_");
  return date.split("T")[0];
};

function formatagain(tableName) {
  // Take first 11 characters and last 6 characters
  const firstPart = tableName.slice(0, 11);
  const lastPart = tableName.slice(-6);

  // Remove all commas, plus signs, slashes
  const formattedFirstPart = firstPart.replace(/[,+/]/g, "");
  const formattedLastPart = lastPart.replace(/[,+/]/g, "");

  // Replace all colons with underscores
  const finalFirstPart = formattedFirstPart.replace(/:/g, "_");
  const finalLastPart = formattedLastPart.replace(/:/g, "_");

  // Combine the first 11 and last 6 parts
  console.log("hey" + finalFirstPart + finalLastPart);
  return finalFirstPart + finalLastPart;
}

app.post("/submit-available-classes/:date/:time", (req, res) => {
  const { date, time } = req.params;
  const { classes } = req.body;

  if (!Array.isArray(classes) || classes.length === 0) {
    return res.status(400).send("No classes selected");
  }

  var formattedDate = formatDate(date); // Get formatted date part
  let tableName = `${formattedDate}` + `${time}`; // Change to `let`

  tableName = formatagain(tableName); // Now this reassignment is allowed

  tableName = `available_classes_` + tableName;
  const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        classname VARCHAR(255),
        classid INT,
        capacity INT,
        available BOOLEAN
      );
    `;

  const values = classes.map(({ className, classId }) => [
    className,
    classId,
    30,
    true,
  ]);

  const insertQuery = `
      INSERT INTO ${tableName} (classname, classid, capacity, available)
      VALUES ?
    `;

  con.query(createTableQuery, (createErr) => {
    if (createErr) {
      console.error("Error creating table:", createErr);
      return res.status(500).send("Error creating table");
    }

    con.query(insertQuery, [values], (insertErr) => {
      if (insertErr) {
        console.error("Error inserting classes:", insertErr);
        return res.status(500).send("Error inserting classes");
      }

      res.send("Classes submitted successfully");
    });
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Unexpected error:", err);
  res.status(500).send("An unexpected error occurred");
});

// *********************************************************************************************/
// *********************************************************************************************/
// *********************************************************************************************/
// *********************************************************************************************/
// *********************************************************************************************/

// Modifications done
app.get("/api/getTables", (req, res) => {
  const getTablesQuery = `
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_NAME LIKE 'available_classes%'
  `;

  con.query(getTablesQuery, (err, results) => {
    if (err) {
      console.error("Error fetching table names:", err);
      return res.status(500).send("Error fetching table names.");
    }

    const tableNames = results.map((row) => row.TABLE_NAME);
    res.json(tableNames);
  });
});

app.post("/api/copyTable", async (req, res) => {
  const { sourceTable } = req.body;

  if (!sourceTable.startsWith("available_classes")) {
    return res.status(400).send("Invalid table name.");
  }

  // SQL to drop the rooms table if it exists
  const dropRoomsQuery = `DROP TABLE IF EXISTS rooms`;

  // SQL to create the rooms table with the classid column
  const createRoomsQuery = `
    CREATE TABLE rooms (
      classname VARCHAR(255) DEFAULT NULL,
      classid INT(11) DEFAULT NULL,
      capacity INT(11) DEFAULT NULL,
      available TINYINT(1) DEFAULT NULL,
      PRIMARY KEY (classname)
    )
  `;

  // SQL to copy unique entries into rooms table and ignore duplicates
  const copyDataQuery = `
    INSERT IGNORE INTO rooms (classname, classid, capacity, available)
    SELECT classname, classid, capacity, available
    FROM ${sourceTable}
  `;

  // Drop the table first
  con.query(dropRoomsQuery, (err) => {
    if (err) {
      console.error("Error dropping rooms table:", err);
      return res.status(500).send("Error resetting rooms table.");
    }

    // Create the table after dropping it
    con.query(createRoomsQuery, (err) => {
      if (err) {
        console.error("Error creating rooms table:", err);
        return res.status(500).send("Error creating rooms table.");
      }

      // Copy data into the newly created rooms table and ignore duplicates
      con.query(copyDataQuery, (err) => {
        if (err) {
          console.error(
            `Error copying data from ${sourceTable} to rooms:`,
            err
          );
          return res.status(500).send("Error copying data.");
        }

        res.send(`Data from ${sourceTable} copied to the rooms table.`);
      });
    });
  });
});

// *********************************************************************************************/
// *********************************************************************************************/
// *********************************************************************************************/
// *********************************************************************************************/
// *********************************************************************************************/
// Team 3
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "assessment",
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err.message);
    process.exit(1);
  }
  console.log("Connected to MySQL");
});

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv") cb(null, true);
    else cb(new Error("Invalid file type. Only CSV files are allowed."));
  },
});

// Ensure uploads directory exists
const uploadDirectory = "uploads/";
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Function to allocate seating
function allocateSeating(tableName, students, subject, res) {
  db.query("SELECT * FROM rooms", (err, rooms) => {
    if (err) {
      console.error("Error retrieving rooms data:", err);
      return res.status(500).send("Error retrieving rooms data.");
    }

    const allocation = [];
    let currentIndex = 0;

    rooms.forEach(({ classid, capacity }) => {
      const rollNumbers = students
        .slice(currentIndex, currentIndex + parseInt(capacity))
        .map((student) => student.roll_no || student.RollNo)
        .join(", ");

      allocation.push([
        classid,
        rollNumbers,
        rollNumbers ? rollNumbers.split(", ").length : 0,
        subject,
      ]);

      currentIndex += parseInt(capacity);
    });

    // Insert allocation data into the subject-specific table
    const insertQuery = `INSERT INTO ${tableName} (classid, RollNumbers, QuestionPaperCount, Subject) VALUES ?`;
    db.query(insertQuery, [allocation], (err) => {
      if (err) {
        console.error("Error saving allocation data:", err);
        return res.status(500).send("Error saving allocation data.");
      }

      // Query the newly inserted data to return to frontend
      const selectQuery = `SELECT * FROM ${tableName}`;
      db.query(selectQuery, (err, results) => {
        if (err) {
          console.error("Error retrieving allocation data:", err);
          return res.status(500).send("Error retrieving allocation data.");
        }

        // Format results as array of objects for frontend
        const formattedResults = results.map((row) => ({
          classid: row.classid,
          RollNumbers: row.RollNumbers,
          QuestionPaperCount: row.QuestionPaperCount,
          Subject: row.Subject,
        }));

        res.json(formattedResults);
      });
    });
  });
}

// Function to create the table and allocate seating for the subject
function createSubjectTable(tableName, students, subject, res) {
  // Create a new table for the subject
  db.query(
    `CREATE TABLE ${tableName} (
      classid VARCHAR(255),
      RollNumbers TEXT,
      QuestionPaperCount INT,
      Subject VARCHAR(255)
    )`,
    (err) => {
      if (err) {
        console.error("Error creating subject table:", err);
        return res.status(500).send("Error creating subject table.");
      }
      console.log(`Table ${tableName} created successfully.`);
      allocateSeating(tableName, students, subject, res); // Call the allocateSeating function
    }
  );
}

// Endpoint to upload CSV and allocate seating
app.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const filePath = req.file.path;
    const subject = req.body.subject;

    if (!subject) {
      return res.status(400).send("Subject is required.");
    }

    const students = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        if (!row.RollNo && !row.roll_no) {
          throw new Error("CSV file must contain 'RollNo' or 'roll_no' column");
        }
        students.push(row);
      })
      .on("end", () => {
        if (students.length === 0) {
          throw new Error("CSV file is empty or invalid format");
        }
        handleSubjectTable(subject, students, res);
      })
      .on("error", (err) => {
        console.error("Error reading CSV file:", err);
        res.status(500).send("Error reading file: " + err.message);
      });
  } catch (err) {
    console.error("Error in upload endpoint:", err);
    res.status(500).send("Error uploading file: " + err.message);
  }
});

// Function to handle the subject and table creation or update
function handleSubjectTable(subject, students, res) {
  try {
    const tableName = `allocation_${subject}`;
    console.log("Subject:", subject, "Table Name:", tableName);

    // Check database connection
    if (!db.threadId) {
      throw new Error("Database connection lost");
    }

    // Check if the table exists
    db.query(`SHOW TABLES LIKE '${tableName}'`, (err, result) => {
      if (err) {
        console.error("Error checking table existence:", err);
        return res
          .status(500)
          .send("Error checking table existence: " + err.message);
      }

      if (result.length === 0) {
        console.log("Creating new table:", tableName);
        createSubjectTable(tableName, students, subject, res);
      } else {
        console.log("Table exists, recreating:", tableName);
        const dropQuery = `DROP TABLE IF EXISTS ${mysql.escapeId(tableName)}`;
        db.query(dropQuery, (err) => {
          if (err) {
            console.error("Error dropping existing table:", err);
            return res
              .status(500)
              .send("Error dropping existing table: " + err.message);
          }

          console.log("Creating new table after dropping:", tableName);
          createSubjectTable(tableName, students, subject, res);
        });
      }
    });
  } catch (err) {
    console.error("Error in handleSubjectTable:", err);
    res.status(500).send("Error handling subject table: " + err.message);
  }
}

// Fetch allocation results
app.get("/results", (req, res) => {
  // Fetch all tables dynamically
  db.query("SHOW TABLES", (err, results) => {
    if (err) {
      console.error("Error fetching table names:", err);
      return res.status(500).send("Error fetching table names.");
    }

    // Filter tables based on your naming convention (e.g., Allocation_1, Allocation_2, ...)
    const allocationTables = results
      .map((row) => Object.values(row)[0])
      .filter((table) => table.startsWith("allocation_"));

    // Create a query to fetch data from all 'Allocation_*' tables
    const queries = allocationTables.map((table) => {
      return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM ${table}`, (err, rows) => {
          if (err) {
            reject(`Error fetching data from ${table}: ${err}`);
          } else {
            resolve({ table, rows });
          }
        });
      });
    });

    // Execute all queries and send the combined results
    Promise.all(queries)
      .then((results) => {
        const groupedData = results.reduce((acc, { table, rows }) => {
          const [prefix, semester, ...rest] = table.split("_"); // Extract the full table name, semester, and subject
          const subject = rest.join("_"); // Rejoin the subject part if it contains underscores
          const fullTableName = `${prefix}_${semester}_${subject}`;

          if (!acc[fullTableName]) acc[fullTableName] = [];
          acc[fullTableName] = [...acc[fullTableName], ...rows]; // Merge the results from different tables
          return acc;
        }, {});

        res.json(groupedData);
      })
      .catch((err) => {
        console.error("Error fetching results:", err);
        res.status(500).send("Error fetching results.");
      });
  });
});

// Fetch roll numbers for a specific class from a dynamically named table
app.get("/class/:subject/:id", (req, res) => {
  const { subject, id } = req.params;

  const tableName = `allocation_${subject}`; // Updated table name based on subject

  const query = `SELECT RollNumbers FROM ?? WHERE classid = ?`;

  db.query(query, [tableName, id], (err, results) => {
    if (err) {
      console.error("Error fetching class data:", err);
      return res.status(500).json({ error: "Error fetching class data." });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Class not found." });
    }

    const rollNumbers = results[0].RollNumbers
      ? results[0].RollNumbers.split(",").map((num) => num.trim())
      : []; // Split and trim roll numbers

    res.json({ rollNumbers });
  });
});

// Assume you're using Express

// Route for updating roll numbers in a class
app.post("/class/:subject/update", async (req, res) => {
  const { subject } = req.params;
  const { rollNumbers, classid } = req.body;

  const tableName = `allocation_${subject}`; // Updated table name

  const query = `UPDATE ?? SET RollNumbers = ? WHERE classid = ?`;

  try {
    await db.query(query, [tableName, rollNumbers.join(","), classid]);
    res.json({ success: true, message: "Roll numbers updated successfully!" });
  } catch (err) {
    console.error("Error updating roll numbers:", err);
    res.status(500).json({ error: "Error updating roll numbers." });
  }
});

// Delete route for removing a roll number from a class
app.post("/class/:subject/delete", async (req, res) => {
  const { subject } = req.params;
  const { rollNumber, classid } = req.body;

  const tableName = `allocation_${subject}`; // Updated table name

  const query = `
    UPDATE ?? 
    SET RollNumbers = REPLACE(RollNumbers, ?, ''),
        QuestionPaperCount = LENGTH(RollNumbers) - LENGTH(REPLACE(RollNumbers, ',', '')) + 1
    WHERE classid = ?`;

  try {
    await db.query(query, [tableName, rollNumber, classid]);
    res.json({ success: true, message: "Roll number removed successfully!" });
  } catch (err) {
    console.error("Error deleting roll number:", err);
    res.status(500).json({ error: "Error deleting roll number." });
  }
});

// Endpoint to drop a specific table
app.post("/drop-table", (req, res) => {
  const { subject } = req.body;

  const tableName = `allocation_${subject}`; // Updated table name

  const dropQuery = `DROP TABLE IF EXISTS ??`;

  db.query(dropQuery, [tableName], (err) => {
    if (err) {
      console.error("Error dropping table:", err);
      return res.status(500).send("Error dropping table.");
    }
    res.send(`Table ${tableName} dropped successfully.`);
  });
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

app.get("/Students", async (req, res) => {
  try {
    db.query("SELECT * FROM students", (error, results) => {
      if (error) {
        console.error("Error fetching students:", error);
        return res.status(500).json({ error: "Failed to fetch students" });
      }
      res.json(results); // Use `results` which contains only the rows
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "Unexpected server error" });
  }
});

app.post("/Students", async (req, res) => {
  const studentData = req.body;

  if (!Array.isArray(studentData) || studentData.length === 0) {
    return res.status(400).json({ error: "Invalid or missing data" });
  }

  const transformedData = studentData.map((student) => {
    if (!student.rollNo || !student.subject) {
      return res.status(400).json({
        error: "rollNo and subject are required for each student",
      });
    }

    return [
      student.rollNo || 0,
      student.bookletNumber || 0,
      student.subject || "Unknown",
      typeof student.attendence === "boolean" ? student.attendence : false,
    ];
  });

  try {
    const query =
      "INSERT INTO Students (rollno, bookletNo, subject, attendence) VALUES ?";
    await db.query(query, [transformedData]);
    res.status(201).json({ message: "Students added successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      res.status(409).json({
        error: "Duplicate entry for rollNo and subject",
      });
    } else {
      console.error("Error while inserting students:", err);
      res.status(500).json({
        error: "Failed to save students",
        details: err.message,
      });
    }
  }
});

app.get("/api/fetch_course_table", (req, res) => {
  let courseName = req.query.courseName?.toLowerCase();
  courseName = "allocation_" + courseName;

  if (!courseName) {
    return res.status(400).json({ error: "courseName is required." });
  }

  const checkTableQuery = `
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'assessment' 
    AND LOWER(table_name) = ?;
  `;

  db.query(checkTableQuery, [courseName], (err, result) => {
    if (err) {
      console.error("Error checking table:", err.message);
      return res.status(500).json({ error: "Database error." });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "Table not found." });
    }

    const tableName = result[0].table_name;

    // Fetch data from the course table
    const fetchCourseTableQuery = `SELECT * FROM ??`;
    db.query(fetchCourseTableQuery, [tableName], (err, courseData) => {
      if (err) {
        console.error("Error fetching table data:", err.message);
        return res.status(500).json({ error: "Failed to fetch table data." });
      }

      // Fetch data from the examsections table
      const fetchExamSectionsQuery = `SELECT exam_section_id, exam_section_name FROM examsections`;
      db.query(fetchExamSectionsQuery, (err, examSectionsData) => {
        if (err) {
          console.error("Error fetching exam sections:", err.message);
          return res
            .status(500)
            .json({ error: "Failed to fetch exam sections." });
        }

        // Match `classid` with the last digit of `exam_section_id`
        const updatedData = courseData.map((courseItem) => {
          const matchingExamSection = examSectionsData.find(
            (examSection) =>
              String(examSection.exam_section_id).slice(-1) ===
              String(courseItem.classid)
          );

          return {
            ...courseItem,
            classid: matchingExamSection
              ? matchingExamSection.exam_section_name
              : "Not Found",
          };
        });

        res.json(updatedData);
      });
    });
  });
});

// app.get("/api/fetch_course_table", (req, res) => {
//   const courseName = req.query.courseName?.toLowerCase();

//   if (!courseName) {
//     return res.status(400).json({ error: "courseName is required." });
//   }

//   // Check if the table exists (case-insensitive)
//   const checkTableQuery = `
//     SELECT table_name
//     FROM information_schema.tables
//     WHERE table_schema = 'assessment'
//     AND LOWER(table_name) = ?;
//   `;

//   db.query(checkTableQuery, [courseName], (err, result) => {
//     if (err) {
//       console.error("Error checking table:", err);
//       return res.status(500).json({ error: "Database error." });
//     }

//     if (result.length === 0) {
//       return res.status(404).json({ error: "Table not found." });
//     }

//     // Fetch contents of the table
//     const fetchTableDataQuery = `SELECT * FROM ??`;
//     db.query(fetchTableDataQuery, [result[0].table_name], (err, data) => {
//       if (err) {
//         console.error("Error fetching table data:", err);
//         return res.status(500).json({ error: "Failed to fetch table data." });
//       }

//       res.json(data);
//     });
//   });
// });

// Start the Server
app.listen(8000, () => {
  console.log(`Server is running on http://localhost:8000`);
});

// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const mysql = require("mysql");

// // const app = express();

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // MySQL Database Connection
// const db1 = mysql.createConnection({
//   host: "127.0.0.1", // Change if not local
//   user: "root", // Your MySQL username
//   password: "", // Your MySQL password
//   database: "assessment", // Your database name
// });

// // Start Server
// const PORT = 8000;
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
