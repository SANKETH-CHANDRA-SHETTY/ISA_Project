/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SendBackendReq from "./SendBackendReq";
import ShowAllEntries from "./ShowAllEntries";
import ShowAbsenties from "./ShowAbsentees";

function AbsenteeEntries({ RollNumbers, classid, SubjectName }) {
  classid = parseInt(classid);
  const rollNumbers = RollNumbers.split(", ");
  const startNo = rollNumbers[0];
  const navigate = useNavigate();

  const [doneSending, setDoneSending] = useState(false);
  const [error, setError] = useState(false);
  const [startBookletNo, setStartBookletNo] = useState(0);
  const [viewEntries, setViewEntries] = useState(false);
  const [showAbsenties, setShowAbsenties] = useState(false);
  const [sample, setSample] = useState(0);

  useEffect(() => {
    const booklet = startBookletNo;
    setAttendanceData(
      rollNumbers.reduce((acc, rollNo) => {
        acc[rollNo] = {
          present: true,
          booklet: booklet + (parseInt(rollNo) - parseInt(startNo)),
        };
        return acc;
      }, {})
    );
  }, [RollNumbers, startNo, startBookletNo]);

  const [attendanceData, setAttendanceData] = useState(() =>
    rollNumbers.reduce((acc, rollNo) => {
      acc[rollNo] = {
        present: true,
        booklet: startBookletNo + (parseInt(rollNo) - parseInt(startNo)),
      };
      return acc;
    }, {})
  );

  const handleSubmit = async () => {
    const attendanceArray = rollNumbers.map((rollNo) => ({
      rollNo,
      present: attendanceData[rollNo].present,
      booklet: attendanceData[rollNo].booklet,
    }));

    const temp = await SendBackendReq(
      attendanceArray,
      startBookletNo + 1,
      SubjectName
    );

    if (temp) {
      setDoneSending(true);
    } else {
      setError(true);
    }
  };

  const updateAttendance = (rollNo, value) => {
    setAttendanceData((prev) => ({
      ...prev,
      [rollNo]: { ...prev[rollNo], present: value === "Present" },
    }));
  };

  const updateBooklet = (rollNo, bookletValue) => {
    setAttendanceData((prev) => ({
      ...prev,
      [rollNo]: { ...prev[rollNo], booklet: parseInt(bookletValue) || 0 },
    }));
  };

  if (error) {
    return <h1>There was an error, maybe you entered invalid entries</h1>;
  }

  if (showAbsenties) {
    return (
      <>
        <ShowAbsenties selectedSubject={SubjectName} />
        <button
          onClick={() => setShowAbsenties(false)}
          className="bg-red-500 text-white p-3 rounded mt-4"
        >
          Back
        </button>
      </>
    );
  }

  if (doneSending) {
    return (
      <div className="flex mt-52 justify-center">
        <h1 className="text-3xl font-bold text-white">
          Your results have been updated , what would you want to do next
        </h1>
        <input
          type="button"
          value="Back"
          onClick={() => setDoneSending(false)}
          className="bg-green-500 text-white p-3 rounded ml-4"
        />
      </div>
    );
  }

  if (viewEntries) {
    return (
      <>
        <ShowAllEntries selectedSubject={SubjectName} />
        <button
          onClick={() => setViewEntries(false)}
          className="bg-red-500 text-white p-3 rounded mt-4"
        >
          Back
        </button>
      </>
    );
  }

  return (
    <>
      <div className="p-4 text-white ml-20 mt-10">
        <input
          type="text"
          value={sample}
          onChange={(e) => {
            setSample(e.target.value);
          }}
          className="bg-yellow-500 text-black border border-gray-600 p-3 rounded ml-14"
        />
        <input
          type="button"
          value="submit"
          onClick={(e) => {
            setStartBookletNo(parseInt(sample));
          }}
          className="bg-yellow-500 text-black border border-gray-600 p-3 rounded ml-14"
        />
        <h3 className="font-bold mb-4 text-2xl">Subject: {SubjectName}</h3>
        {rollNumbers.map((rollNo) => (
          <InputBox
            key={rollNo}
            rollNo={rollNo}
            attendance={attendanceData[rollNo]}
            updateAttendance={updateAttendance}
            updateBooklet={updateBooklet}
          />
        ))}
      </div>

      <div className="ml-10 mt-6">
        <input
          type="button"
          value="Submit"
          onClick={handleSubmit}
          className="bg-yellow-500 text-black border border-gray-600 p-3 rounded ml-14"
        />
        <input
          type="button"
          value="Show all entries till now"
          onClick={() => setViewEntries(true)}
          className="bg-green-500 text-white p-3 rounded ml-4"
        />
        <br />
        <input
          type="button"
          value="Back"
          onClick={() => navigate("/team3/app3")}
          className="bg-blue-500 text-white p-3 rounded ml-4"
        />
        <input
          type="button"
          value="Show the absentiee entries"
          onClick={() => setShowAbsenties(true)}
          className="bg-red-500 text-white p-3 rounded ml-4"
        />
      </div>
    </>
  );
}

function InputBox({ rollNo, attendance, updateAttendance, updateBooklet }) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <input
        type="number"
        value={rollNo}
        readOnly
        className="border border-gray-600 p-2 rounded bg-gray-800 text-white"
      />
      <select
        value={attendance.present ? "Present" : "Absent"}
        onChange={(e) => updateAttendance(rollNo, e.target.value)}
        className="border border-gray-600 bg-black p-2 rounded text-white"
      >
        <option value="Present">Present</option>
        <option value="Absent">Absent</option>
      </select>
      <input
        type="number"
        value={attendance.booklet}
        onChange={(e) => updateBooklet(rollNo, e.target.value)}
        className="border border-gray-600 p-2 rounded bg-gray-800 text-white"
        placeholder="Booklet No."
      />
    </div>
  );
}

export default AbsenteeEntries;
