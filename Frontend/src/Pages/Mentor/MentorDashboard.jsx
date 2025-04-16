import React, { useState, useEffect } from 'react';
import { NavLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Attendance from '../../Components/Attendance';
import { useAuthContext } from '../../Contexts/AuthContext';
const { VITE_BACKEND_URL } = import.meta.env;

function MentorDashboard() {
    const { user, isLoggedIn } = useAuthContext();
    const [sessionBtnValue, setSessionBtnValue] = useState(null);
    const [session, setSession] = useState([]);
    const [data, setData] = useState({});
    const [completedSessions, setCompletedSessions] = useState(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [attendanceActive, setAttendanceActive] = useState(false);
    const [countdown, setCountdown] = useState(0);


    useEffect(() => {
        getSessionData();
    }, [isLoggedIn, completedSessions]);

    useEffect(() => {
        let timer;
        if (attendanceActive && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else if (countdown === 0 && attendanceActive) {
            // Timer over, re-enable everything
            setAttendanceActive(false);
        }

        return () => clearInterval(timer);
    }, [attendanceActive, countdown]);


    const notify = () => toast.warn(errors.heading?.message || errors.content?.message || errors.link?.message);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm();

    const totalClass = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    const sessionBtn = (e) => {
        setSessionBtnValue(Number(e.target.innerHTML));
    };

    const onSubmit = async (formData) => {
        if (!sessionBtnValue) {
            toast.warn("Please select a session first!");
            return;
        }

        const content = { [sessionBtnValue]: formData };

        await handleInput({ session_data: content, course_id: user.course_id });

        setCompletedSessions((prev) => new Set(prev).add(sessionBtnValue));
        reset();
    };

    const handleInput = async (data) => {
        try {
            setIsLoading(true);
            const response = await fetch(`${VITE_BACKEND_URL}/createSession`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.info(result.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const getSessionData = async () => {
        try {
            const response = await fetch(`${VITE_BACKEND_URL}/getSession/${user.course_id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const result = await response.json();
            if (result.success) {
                setSession(result.sessionData);
                setData(result.sessionData[0]?.session_data || {});
                const completed = new Set(Object.keys(result.sessionData[0]?.session_data || {}).map(Number));
                setCompletedSessions(completed);
            } else {
                toast.info(result.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };
    
    const handleTakeAttendance = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${VITE_BACKEND_URL}/startAttendance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ courseId: user.course_id }),
            });
            const result = await response.json();
            if (result.success) {
                toast.success("Attendance marking enabled");
                // Disable the button, hide manual mode, and start timer (3 mins = 180 seconds)
                setAttendanceActive(true);
                setCountdown(10);
            } else {
                toast.warn(result.message);
            }
        } catch (error) {
            toast.error("Failed to take attendance!");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div>
            <div className='flex flex-col gap-3 w-full  bg-v1 p-10'>
                <h1 className='text-4xl text-white mb-2'> Hi Mentor,</h1>
                {/* grid grid-cols-2 gap-2 grid-flow-row */}
                <div className='flex justify-evenly m-10 flex-wrap  gap-20'>
                    <NavLink
                        to="/mentor/viewstudents"
                        className={`
                    w-[300px]
                    text-center
                    rounded-xl text-xl
                    font-semibold hover:text-white py-3 px-4  hover:border-transparent transition duration-500 outline-none mt-5 mb-4 
                    bg-transparent border-white border-2 hover:bg-b2 text-white
                        `}
                    >
                        Students
                    </NavLink>

                    <NavLink
                        to="https://meet-clone-xsvm.onrender.com/"
                        className={` 
                    w-[300px]
                    text-center
                    rounded-xl text-xl
                    font-semibold hover:text-white py-3 px-4  hover:border-transparent transition duration-500 outline-none mt-5 mb-4 
                    bg-transparent border-white border-2 hover:bg-b2 text-white
                        `}
                    >
                        Online Meet
                    </NavLink>
                    <button
                        onClick={handleTakeAttendance}
                        disabled={attendanceActive}
                        className={`w-[300px] text-center rounded-xl text-xl font-semibold py-3 px-4 mt-5 mb-4 transition duration-500 outline-none 
    ${attendanceActive ? "bg-gray-400 text-white cursor-not-allowed" : "bg-transparent border-white border-2 hover:bg-b2 text-white"}`}>
                        Enable Attendance
                    </button>

                    <NavLink
                        to="/mentor/markatt"
                        className={`w-[300px] text-center rounded-xl text-xl font-semibold hover:text-white py-3 px-4 hover:border-transparent transition duration-500 outline-none mt-5 mb-4 bg-transparent border-white border-2 hover:bg-b2 text-white`}>
                        Mark Attendance
                    </NavLink>

                    <NavLink
                        to="/mentor/attregister"
                        className={`w-[300px] text-center rounded-xl text-xl font-semibold hover:text-white py-3 px-4 hover:border-transparent transition duration-500 outline-none mt-5 mb-4 bg-transparent border-white border-2 hover:bg-b2 text-white`}>
                        Register Face
                    </NavLink>

                    <NavLink
                        to="/mentor/attrecords"
                        className={`w-[300px] text-center rounded-xl text-xl font-semibold hover:text-white py-3 px-4 hover:border-transparent transition duration-500 outline-none mt-5 mb-4 bg-transparent border-white border-2 hover:bg-b2 text-white`}>
                        Attendance Records
                    </NavLink>

                    <NavLink
                        to="/mentor/attregusers"
                        className={`w-[300px] text-center rounded-xl text-xl font-semibold hover:text-white py-3 px-4 hover:border-transparent transition duration-500 outline-none mt-5 mb-4 bg-transparent border-white border-2 hover:bg-b2 text-white`}>
                        Registered Users
                    </NavLink>


                </div>
            </div>
            <div className='grid grid-cols-4 ml-3 gap-5'>
                <div className='col-span-3 max-w-[95%] p-8 border-gray-900 border-2 mt-10'>
                    <div className='mb-4'>
                        <div className="text-3xl font-semibold">
                            {data[sessionBtnValue]?.heading || "Class schedule is not updated"}
                        </div>
                    </div>
                    <div className='pl-4 mb-4'>
                        <p className='text-xl'>{data[sessionBtnValue]?.content || "No contents available"}</p>
                    </div>
                    <h3 className='text-2xl font-semibold mb-4'>Content Link:</h3>
                    {data[sessionBtnValue]?.link ? <a href={data[sessionBtnValue]?.link} target="_blank" className='underline text-xl text-blue-700'>Link to Class</a> : <p>Link not available</p>}
                </div>
                <div className='col-span-1 -ml-6'>
                    <h2 className='text-3xl font-semibold mb-4 text-center'>Session Roadmap</h2>
                    <div className="grid grid-cols-3 gap-y-4 place-items-center border-black border-2 rounded-2xl p-5">
                        {totalClass.map((i) => (
                            <button
                                key={i}
                                onClick={sessionBtn}
                                className={`rounded-full w-12 h-12 border-black border-2 flex items-center justify-center ${completedSessions.has(i) ? "bg-green-500 text-white" : "bg-white"}`}
                            >
                                {i}
                            </button>
                        ))}
                    </div>
                </div>
                <div className='col-span-3 max-w-[95%] p-8 border-gray-900 border-2 mt-10'>
                    {!completedSessions.has(sessionBtnValue) && (
                        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col m-10 w-5/6'>
                            <input className="text-xl text-black outline-none border-solid border-black border-2 bg-white mb-5 py-2 px-5" placeholder="Enter Heading" type="text" {...register("heading", { required: "Heading is required" })} />
                            <textarea className="text-xl text-black outline-none border-solid border-black bg-white border-2 mb-5 py-2 px-5" placeholder="Enter Content" {...register("content", { required: "Content is required" })}></textarea>
                            <input className="text-xl text-black outline-none border-solid border-black bg-white border-2 mb-5 py-2 px-5" placeholder="Enter Content Link" type="text" {...register("link", { required: "Content Link is required" })} />
                            <button className={`w-full rounded-xl font-bold hover:text-white py-3 px-4 border hover:border-transparent transition duration-500 outline-none mt-5 mb-4 ${isLoading ? "bg-green-600 text-white" : "bg-transparent border-black border-2 hover:bg-db text-darkb"}`} type="submit" onClick={notify}>Add Content</button>
                        </form>
                    )}
                </div>
                <div className="-ml-6 w-full">
                    {!attendanceActive ? (
                        <Attendance course_id={user.course_id} handleTakeAttendance={handleTakeAttendance} />
                    ) : (
                        <div className="h-60 p-5 border-2 border-black rounded-xl mt-5 w-fit text-xl font-semibold text-center text-white bg-gray-700">
                            Attendance is active... <br /> Time left: {countdown} seconds
                        </div>
                    )}
                </div>


            </div>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark" transition:Bounce />
        </div>
    );
}

export default MentorDashboard;
