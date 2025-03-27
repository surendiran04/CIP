import React from 'react'
import { useAuthContext } from "../Contexts/AuthContext";
import { NavLink } from "react-router-dom";


function Profile() {

  const { user,decodedToken } = useAuthContext();
  const userRole = decodedToken?.role[0] ;
  const name = user?.student_name;
  const mname = user?.mentor_name;
  const email = user?.email;
  const phone = user?.phone;
 
  return (
    <div className="bg-gradient-to-r from-blue-50 to-gray-100 min-h-screen flex items-center justify-center p-6">
      <div className="bg-darkb text-white p-12 rounded-lg shadow-xl w-full max-w-2xl">
        
        {/* Profile Heading */}
        <h2 className="text-4xl font-bold text-white text-center mb-6">
          Profile
        </h2>

        {/* Profile Info */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md space-y-4">
          <p className="text-lg">
            <span className="font-semibold text-gray-300">Name:</span> 
            <span className="text-gold1 ml-2">{userRole === "student" ? name : mname}</span>
          </p>
          <p className="text-lg">
            <span className="font-semibold text-gray-300">Email:</span> 
            <span className="text-gold1 ml-2">{email}</span>
          </p>
          <p className="text-lg">
            <span className="font-semibold text-gray-300">Phone:</span> 
            <span className="text-gold1 ml-2">{phone}</span>
          </p>
        </div>

        {/* My Courses Button */}
        <NavLink
          to="/courses"
          className="
            block text-center mt-6 px-6 py-3 w-full
            bg-transparent border-2 border-white text-white font-semibold
            rounded-lg transition duration-300
            hover:bg-b2 hover:text-darkb hover:border-b2
          "
        >
          My Courses
        </NavLink>
      </div>
    </div>
  );
}

export default Profile