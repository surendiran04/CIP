import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthContext } from '../../Contexts/AuthContext';
import {
  FiUsers,
  FiBook,
  FiPlusCircle,
  FiUserPlus,
} from 'react-icons/fi';

const AdminDashboard = () => {
  const { user } = useAuthContext();

  const dashboardCards = [
    {
      title: 'View Students',
      path: '/admin/viewstudents',
      icon: <FiUsers className="text-4xl" />,
      textColor: 'text-blue-600',
    },
    {
      title: 'View Mentors',
      path: '/admin/viewmentors',
      icon: <FiUsers className="text-4xl" />,
      textColor: 'text-green-600',
    },
    {
      title: 'View Courses',
      path: '/admin/viewcourses',
      icon: <FiBook className="text-4xl" />,
      textColor: 'text-purple-600',
    },
    {
      title: 'Create Course',
      path: '/admin/createcourse',
      icon: <FiPlusCircle className="text-4xl" />,
      textColor: 'text-yellow-600',
    },
    {
      title: 'Create Mentor',
      path: '/admin/signup',
      icon: <FiUserPlus className="text-4xl" />,
      textColor: 'text-red-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-200 pt-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Hi Admin</h1>
          <div className="flex items-center space-x-4">
            <span className="text-white font-medium">{user?.name || 'Admin'}</span>
            <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-white font-bold shadow-md border-2 border-transparent hover:shadow-lg transition duration-300">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </div>
      </div>

      {/* Cards Only */}
      <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Row 1 - 3 cards */}
        <div className="flex flex-wrap justify-center gap-10">
          {dashboardCards.slice(0, 3).map((card, index) => (
            <NavLink
              key={index}
              to={card.path}
              className="w-80 bg-blue-100 rounded-2xl shadow-lg p-12 hover:shadow-2xl hover:scale-105 transition duration-300 transform flex flex-col items-center justify-center"
            >
              <div className={`${card.textColor} mb-6 text-6xl`}>
                {card.icon}
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 text-center">
                {card.title}
              </h3>
            </NavLink>
          ))}
        </div>

        {/* Row 2 - 2 centered cards */}
        <div className="flex justify-center gap-10">
          {dashboardCards.slice(3).map((card, index) => (
            <NavLink
              key={index + 3} // offset index to avoid key conflict
              to={card.path}
              className="w-80 bg-blue-100 rounded-2xl shadow-lg p-12 hover:shadow-2xl hover:scale-105 transition duration-300 transform flex flex-col items-center justify-center"
            >
              <div className={`${card.textColor} mb-6 text-6xl`}>
                {card.icon}
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 text-center">
                {card.title}
              </h3>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
