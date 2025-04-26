import { useEffect, useState } from "react";
const { VITE_BACKEND_URL1 } = import.meta.env;

import { useAuthContext } from "../../../Contexts/AuthContext";

const Records = () => {
  const { user } = useAuthContext();

  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.course_id) return; 
      console.log("Req sent")
      try {
        const response = await fetch(`${VITE_BACKEND_URL1}/attendance/${user.course_id}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json",
               "ngrok-skip-browser-warning": "69420" }
           
          }
        );
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        setRecords(data.attendance_records || []);
        console.log("data",data)
      }else {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        setRecords([]);
      }
      } catch (error) {
        console.error("Error fetching attendance:", error);
        setRecords([]);
      }
    };
    fetchData();
  }, [user]);
  
  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold text-center mb-4">
        Attendance Records
      </h2>
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 w-1/2">Name</th>
              <th className="border p-2 w-1/2">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {records.length > 0 ? (
              records.map((record, index) => (
                <tr key={index} className="border">
                  <td className="border p-2 w-1/2 text-center">
                    {record.name}
                  </td>
                  <td className="border p-2 w-1/2 text-center">
                    {new Date(record.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center p-4 text-gray-500">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Records;
