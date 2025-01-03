import React, { useState, useEffect } from "react";
import {Link} from "react-router-dom"
import axios from "axios";
import App3 from "./team3/App3.jsx"

export default function Team3() {
  const [tables, setTables] = useState([]);

  // Fetch tables from the backend
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/getTables"); // API to fetch available tables
        const filteredTables = response.data.filter((tableName) =>
          tableName.startsWith("available_classes")
        );
        setTables(filteredTables);
      } catch (error) {
        console.error("Error fetching tables:", error);
      }
    };

    fetchTables();
  }, []);

  // Handle button click to copy table
  const handleCopyTable = async (tableName) => {
    try {
      await axios.post("http://localhost:8000/api/copyTable", {
        sourceTable: tableName,
      });
      alert(`Table ${tableName} has been copied to the rooms table.`);
    } catch (error) {
      console.error("Error copying table:", error);
      alert("Failed to copy table.");
    }
  };

  return (
    <div>
      <h1>Team 3</h1>
      {tables.map((tableName, index) => (
        <button key={index} onClick={() => handleCopyTable(tableName)}>
          {tableName} button {index + 1}
        </button>
      ))}
      <Link to="./app3">To Divide Students</Link>
    </div>
  );
}
