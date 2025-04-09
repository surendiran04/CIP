import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const { VITE_BACKEND_URL } = import.meta.env;
import { useAuthContext } from "../Contexts/AuthContext";

function Attendance() {
  const [isLoading, setIsLoading] = useState(false);
  const [StudentsData, setStudentsData] = useState([]);
  const { user, isLoggedIn } = useAuthContext();

  let notify = () => toast.warn(errors.message);

  useEffect(() => {
    getCourseStudents();
  }, [isLoggedIn]);

  const attendanceBtn = (data) => {
    const val = {};
    val.student_ids = data;
    val.course_id = user?.course_id;
    updateAttendance(val);
    reset();
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const getCourseStudents = async () => {
    try {
      const response = await fetch(
        `${VITE_BACKEND_URL}/getStudentByCourse/${user.course_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        setStudentsData(result.data);
      } else {
        toast.info(result.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const updateAttendance = async (data) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${VITE_BACKEND_URL}/updateAttendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.info(result.message);
        console.log(result.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <div>
        <h2 className="text-3xl font-semibold mb-4 text-center">Attendance</h2>
        <form
          className="border-black border-2 p-6 rounded-xl bg-white"
          onSubmit={handleSubmit(attendanceBtn)}
        >
          <table className="w-full table-fixed border-separate border-spacing-y-2">
            <thead>
              <tr className="text-center text-lg font-semibold border-b border-gray-300">
                <th className="w-1/12 border-r border-gray-400">#</th>
                <th className="w-3/12 border-r border-gray-400">Name</th>
                <th className="w-2/12 border-r border-gray-400">Present</th>
                <th className="w-2/12">Absent</th>
              </tr>
            </thead>
            <tbody>
              {StudentsData?.map((d, i) => (
                <tr key={i} className="text-center text-base">
                  <td className="py-2 align-middle border-r border-gray-200">
                    {i + 1}.
                  </td>
                  <td className="py-2 align-middle border-r border-gray-200">
                    {d.student_name}
                  </td>
                  <td className="py-2 align-middle border-r border-gray-200">
                    <input
                      className="scale-125 accent-green-600"
                      {...register(`${d.student_id}`, {
                        required: "Attendance is required",
                      })}
                      type="radio"
                      name={d.student_id}
                      value="1"
                    />
                  </td>
                  <td className="py-2 align-middle">
                    <input
                      className="scale-125 accent-red-600"
                      {...register(`${d.student_id}`, {
                        required: "Attendance is required",
                      })}
                      type="radio"
                      name={d.student_id}
                      value="0"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            className={`
                w-full
                rounded-xl
                font-bold
                hover:text-white
                py-3 px-4
                border
                hover:border-transparent
                transition duration-500
                outline-none
                mt-5 mb-4
                ${isLoading
                ? "bg-green-600 text-white"
                : "bg-transparent border-black border-2 hover:bg-db text-darkb"
              }
            `}
            type="submit"
            onClick={notify}
            disabled={isLoading}
          >
            Submit
          </button>

        </form>

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          transition:Bounce
        />
      </div>
    </div>
  );
}

export default Attendance;
