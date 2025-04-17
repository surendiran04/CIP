import React, { useEffect, useState } from "react";
import AccordianVideo from "../../Components/AccordianVideo";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../Contexts/AuthContext";
import { io } from "socket.io-client";
const { VITE_BACKEND_URL } = import.meta.env;

const socket = io(VITE_BACKEND_URL);

function Class() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [sessionBtnValue, setSessionBtnValue] = useState(null);
  const [data, setData] = useState({});
  const [attendance, setAttendance] = useState();

  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [attendanceToken, setAttendanceToken] = useState(null);
  const [showPopup, setShowPopup] = useState(false);


  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to WebSocket:", socket.id);
    });

    return () => socket.off("connect");
  }, []);

  socket.onAny((event, data) => {
    console.log("Received event:", event, "with data:", data);
  });


  useEffect(() => {
    getSessionData();
    getAttendance({ course_id: id, student_id: user?.student_id });
    if (!id) return;  // Ensure courseId exists

    console.log("🔹 Joining room:", id);
    socket.emit("joinRoom", id);  // Students join the course room

    socket.on("roomJoined", (room) => {
      console.log(`Successfully joined room: ${room}`);
    });

    socket.on("attendanceStarted", (data) => {
      console.log("Attendance event received with token:", data?.token);
      setShowPopup(true);
      setIsButtonEnabled(true);  // Enable the button
      setAttendanceToken(data?.token);  // Store the token
      setTimeout(() => setShowPopup(false), 4000);
    });

    return () => {
      socket.emit("leaveRoom", id);  // Leave room when component unmounts
      socket.off("attendanceStarted");
    };
  }, [id]);

  const sessionBtn = (e) => {
    setSessionBtnValue(e.target.innerHTML);
  };

  //attendance link to be added here
  const handleAttendanceClick = () => {
    if (attendanceToken) {
      navigate(`/student/markatt/${attendanceToken}/${id}`)
    }
  };

  const getAttendance = async (data) => {
    try {
      const response = await fetch(`${VITE_BACKEND_URL}/getAttendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success) {
        setAttendance(result.data.attendance);
      } else {
        console.log(result.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const getSessionData = async () => {
    try {
      const response = await fetch(`${VITE_BACKEND_URL}/getSession/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      if (result.success) {
        setData(result.sessionData[0]?.session_data);
      } else {
        console.log(result.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const totalClass = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];


  return (
    <div className="grid grid-cols-4 p-4 gap-8">
      {/* Popup Notification for Attendance */}
      {showPopup && (
        <div className="fixed top-10 right-10 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50">
          Attendance Marking Enabled! Please mark your presence.
        </div>
      )}
      <div className="col-span-3 p-10 border-gray-900 border-2 mt-10">
        <div className=" mb-4 ">
          <div className="text-3xl font-semibold ">
            {data && data[sessionBtnValue]
              ? data[sessionBtnValue].heading
              : "Class schedule is not updated"}
          </div>
        </div>
        <div className="pl-4 mb-20">
          <ul className="list-decimal text-xl">
            {data && data[sessionBtnValue] && data[sessionBtnValue].content ? (
              <p>{data[sessionBtnValue]?.content}</p>
            ) : (
              "No contents available"
            )}
          </ul>
        </div>
        <h3 className="text-2xl font-semibold  mb-4">Content Link:</h3>
        {data && data[sessionBtnValue] && data[sessionBtnValue].link ? (
          <a
            href={data[sessionBtnValue]?.link}
            target="_blank"
            className="underline text-xl text-blue-700"
          >
            Link to Class
          </a>
        ) : (
          <p>Link not available</p>
        )}
      </div>
      <div className="">
        <div className="col-span-1 h-60 mb-14">
          <h2 className="text-3xl font-semibold  mb-4">Session Roadmap</h2>
          <div className="grid grid-cols-3  h-full place-content-evenly pl-8 border-black border-2">
            {totalClass.map((i) => (
              <button
                className="bg-white rounded-full w-12 h-12 border-black border-2"
                key={i}
                onClick={sessionBtn}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
        <div className="h-40 p-2 border-black border-2">
          <h2 className="text-3xl font-semibold  mb-4">Attendance</h2>
          <div className="flex items-center justify-center gap-4">
            <meter
              value={attendance}
              min="0"
              max="100"
              className="text-4xl "
            ></meter>
            <span
              className={`text-xl font-bold ${attendance > 75 ? "text-green-900" : "text-r"
                }`}
            >
              {attendance}%
            </span>
          </div>
          <button
            onClick={handleAttendanceClick}
            disabled={!isButtonEnabled}
            style={{
              backgroundColor: isButtonEnabled ? "blue" : "gray",
              color: "white",
              padding: "10px 15px",
              border: "none",
              cursor: isButtonEnabled ? "pointer" : "not-allowed"
            }}
          >
            Mark Attendance
          </button>
        </div>
      </div>
      <div className="col-span-4 w-full p-8 border-black border-2">
        <h2 className="text-3xl font-semibold  mb-4">Tutorial Link:</h2>
        <AccordianVideo />
      </div>
    </div>
  );
}

export default Class;
