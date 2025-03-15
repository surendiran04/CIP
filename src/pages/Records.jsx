import { useEffect, useState } from "react";
const { VITE_BACKEND_URL } = import.meta.env;

const Records = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${VITE_BACKEND_URL}/attendance`, {
          method: "GET",
          credentials: 'include' 
        });
  
        const data = await response.json(); 
        console.log(data);
        setRecords(data.attendance_records || []); 
      } catch (error) {
        console.error("Error fetching attendance:", error);
        setRecords([]); 
      }
    };
  
    fetchData();
  }, []);
  

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold text-center mb-4">Attendance Records</h2>
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Name</th>
              <th className="border p-2">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {records.length > 0 ? (
              records.map((record, index) => (
                <tr key={index} className="border">
                  <td className="border p-2">{record.name}</td>
                  <td className="border p-2">
                    {new Date(record.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center p-4 text-gray-500">No records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Records;
