import React, { useEffect } from "react";
import { useCourseContext } from "../../Contexts/CourseContext";
import MentorPic from "../../assets/mentor.svg";
import thumb1 from "../../assets/thumb-1.png";
import { Link } from "react-router-dom";

function Mycourses() {
  const {filterdata} = useCourseContext();

  return (
    <div className="bg-gradient-to-r from-blue-50 to-gray-100 min-h-screen pt-10">
      <div className="flex flex-wrap gap-6 justify-center ">
        {filterdata?.map((data, i) => (
          <div
            key={i}
            className="bg-white shadow-md hover:shadow-lg transition-shadow p-4 rounded-xl w-80 border border-gray-400"
          >
            {/* Mentor Section */}
            <div className="flex items-center mb-4">
              <img
                src={MentorPic}
                alt="mentor"
                className="h-16 w-16 rounded-full border border-gray-300 p-1"
              />
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  {data.mentor_name}
                </h3>
                <span className="text-gray-500 text-sm">{data.duration}</span>
              </div>
            </div>

            {/* Course Thumbnail */}
            <div className="mb-3">
              <img
                src={thumb1}
                alt="course thumbnail"
                className="h-48 w-full object-cover rounded-lg"
              />
            </div>

            {/* Course Name */}
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {data.course_name}
            </h3>

            {/* Watch Button */}
            <Link to={`/student/class/${data.course_id}`}>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-semibold py-2 rounded-lg transition">
                Watch
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Mycourses;