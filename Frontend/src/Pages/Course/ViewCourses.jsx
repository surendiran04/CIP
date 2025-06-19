import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useCourseContext } from "../../Contexts/CourseContext";
import MentorPic from "../../assets/mentor.svg";
import thumb1 from "../../assets/thumb-1.png";

function AdminViewCourses() {
  const { courseData, isLoading } = useCourseContext();
  const [cdata, setCdata] = useState([]);

  useEffect(() => {
    setCdata(courseData);
  }, [courseData]);

  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    const filterdata = courseData.filter((d) =>
      d.course_name.toLowerCase().includes(data.search.toLowerCase())
    );
    setCdata(data.search === "" ? courseData : filterdata);
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-gray-100 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b-2 border-black z-10">
        <section className="flex py-4 px-8 items-center justify-between">
          <h1 className="text-3xl font-semibold text-black">All Courses</h1>
          <form
            className="flex items-center bg-white shadow-md rounded-full px-4 py-2 border border-gray-300 focus-within:shadow-lg hover:border-gray-400"
            onKeyUp={handleSubmit(onSubmit)}
          >
            <input
              type="text"
              placeholder="Search courses..."
              maxLength="100"
              className="text-lg bg-transparent outline-none px-2"
              {...register("search")}
            />
            <button type="submit" className="text-gray-500 hover:text-gray-700">
              <FaSearch />
            </button>
          </form>
        </section>
      </header>

      {/* Course Cards */}
      <div className="flex flex-wrap gap-6 justify-center mt-6">
        {isLoading ? (
          <p className="text-lg font-semibold text-gray-600">Courses are loading...</p>
        ) : (
          cdata?.map((data, i) => (
            <div
              key={i}
              className="bg-white shadow-md hover:shadow-lg transition-shadow p-4 rounded-xl w-80 border border-gray-400"
            >
              <div className="flex items-center mb-4">
                <img src={MentorPic} alt="mentor" className="h-16 w-16 rounded-full border p-1" />
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-800">{data.mentor_name}</h3>
                  <span className="text-gray-500 text-sm">{data.duration}</span>
                </div>
              </div>

              <img src={thumb1} alt="course thumbnail" className="h-48 w-full object-cover rounded-lg mb-3" />

              <h3 className="text-xl font-semibold text-gray-900 mb-3">{data.course_name}</h3>

              <Link to={`/coursedetails/${data.course_id}`}>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-2 rounded-lg transition">
                  Read More
                </button>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminViewCourses;
