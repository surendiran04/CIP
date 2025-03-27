import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSearch } from "react-icons/fa";
import { BookCheck } from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import { useAuthContext } from "../../Contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MentorPic from "../../assets/mentor.svg";
import thumb1 from "../../assets/thumb-1.png";
import { useCourseContext } from "../../Contexts/CourseContext";

function Courses() {
  const { isLoggedIn } = useAuthContext();

  const { courseData, isLoading } = useCourseContext();

  const [cdata, setCdata] = useState([]);
  useEffect(() => {
    setCdata(courseData); // Update cdata when courseData updates
  }, [courseData]);

  const onSubmit = (data) => {
    const filterdata = courseData.filter((d) => d.course_name.toLowerCase().includes(data.search.toLowerCase()))
    SetCdata(filterdata)
    if (data.search == "") {
      SetCdata(courseData)
    }
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  return (
    <div className="bg-gradient-to-r from-blue-50 to-gray-100 min-h-screen">
      <header className="sticky top-0 right-0 left-0 bg-white z-0 border-b-2 border-solid border-black ">
        <section className="flex relative py-4 px-8 ">
          <a href="#" className="text-3xl font-semibold pl-4 text-black">
            E-Learning
          </a>
          <form
            className="flex items-center w-4/12 mx-auto bg-white shadow-md rounded-full px-4 py-2 border border-gray-300 transition-all focus-within:shadow-lg hover:border-gray-400"
            onKeyUp={handleSubmit(onSubmit)}
          >
            <input
              type="text"
              placeholder="Search courses..."
              maxLength="100"
              className="w-full text-lg bg-transparent outline-none px-2"
              {...register("search")}
            />
            <button
              type="submit"
              className="text-gray-500 transition-all hover:text-gray-700 focus:text-gray-700"
            >
              <FaSearch />
            </button>
          </form>

          {isLoggedIn &&
            <NavLink className="text-xl flex gap-1 ml-72 mt-2 " to="/student/mycourses">
              <BookCheck className="mt-1" />
              My course
            </NavLink>
          }
        </section>
      </header>
      <div className="flex flex-wrap gap-6 justify-center mt-6">
        {isLoading ? (
          <div className="text-lg font-semibold text-gray-600">Courses are loading...</div>
        ) : (
          cdata?.map((data, i) => (
            <div
              key={i}
              className="bg-white shadow-md hover:shadow-lg transition-shadow p-4 rounded-xl w-80 border border-gray-400"
            >
              {/* Mentor Section */}
              <div className="flex items-center mb-4">
                <img src={MentorPic} alt="mentor" className="h-16 w-16 rounded-full border border-gray-300 p-1" />
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-800">{data.mentor_name}</h3>
                  <span className="text-gray-500 text-sm">{data.duration}</span>
                </div>
              </div>

              {/* Course Thumbnail */}
              <div className="mb-3">
                <img src={thumb1} alt="course thumbnail" className="h-48 w-full object-cover rounded-lg" />
              </div>

              {/* Course Name */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{data.course_name}</h3>

              {/* Read More Button */}
              <Link to={`/coursedetails/${data.course_id}`}>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-semibold py-2 rounded-lg transition">
                  Read More
                </button>
              </Link>
            </div>
          ))
        )}
      </div>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition:Bounce
        className="z-[1000]"
      />
    </div>
  );
}

export default Courses;
