import Login from '../Pages/Student/Login'
import Signup from "../Pages/Student/Signup";
import ForgotPassword from "../Pages/Student/ForgotPassword";
import UpdatePassword from '../Pages/Student/UpdatePassword';
import Home from "../Pages/Home"
import CourseDetails from "../Pages/Course/CourseDetails";
import MentorLogin from '../Pages/Mentor/MentorLogin';
import MentorSignUp from '../Pages/Mentor/MentorSignup';
import MentorForgotPassword from '../Pages/Mentor/MentorForgotPassword'
import MentorUpdatePassword from '../Pages/Mentor/MentorUpdatePassword';
import Profile from '../Pages/Profile';
import Checkout from '../Pages/Course/Checkout';
import MentorDashboard from '../Pages/Mentor/MentorDashboard';
import ViewStudents from '../Pages/Mentor/ViewStudents';
import ViewMentors from '../Pages/Mentor/ViewMentors';
import CreateCourse from '../Pages/Course/CreateCourse';
import Courses from '../Pages/Course/Courses';
import Mycourses from '../Pages/Course/Mycourses';
import Class from '../Pages/Course/Class';
import AdminDashboard from '../Pages/Admin/AdminDashboard';
// import Pin from '../Pages/Admin/Pin';
import AdminCoursesDetails from '../Pages/Course/ViewCourses';
import AttendanceHome from "../Pages/Mentor/Attendance/Home"
import Records from "../Pages/Mentor/Attendance/Records"
import RegisteredUsers from "../Pages/Mentor/Attendance/RegisteredUsers"
import Register from "../Pages/Mentor/Attendance/RegisterFace"
import FaceAttendance from '../Pages/Course/Attendance';

export const ROUTES = [
  {
    title: "Home",
    Component: Home,
    path: "/"
  },
  {
    title: "Courses",
    Component: Courses,
    path: "/courses"
  },
  {
    title: "course details",
    Component: CourseDetails,
    path: "/coursedetails/:id"
  },
  {
    title: "Profile",
    Component: Profile,
    path: "/profile"
  }, {
    title: "Checkout",
    Component: Checkout,
    path: "/checkout/:id"
  }
];

export const studentPrivateRoutes = [
  {
    title: "My courses",
    Component: Mycourses,
    path: "/mycourses",
  },
  {
    title: "Class",
    Component: Class,
    path: "/class/:id",
  },
];

export const studentPublicRoutes = [
  {
    title: "Sign In",
    Component: Login,
    path: "/login",
  },
  {
    title: "Sign Up",
    Component: Signup,
    path: "/signup",
  },
  {
    title: "Reset Password",
    Component: ForgotPassword,
    path: "/forgotPassword",
  },
  {
    title: "update Password",
    Component: UpdatePassword,
    path: "/resetPassword/:id/:token",
  },
];

export const mentorPublicRoutes = [
  {
    title: "Mentor Login",
    Component: MentorLogin,
    path: "/Login",
  },
  {
    title: "Mentor Reset Password",
    Component: MentorForgotPassword,
    path: "/ForgotPassword",
  },
  {
    title: "Mentor update password",
    Component: MentorUpdatePassword,
    path: "/resetPassword/:id/:token",
  }
];

export const mentorPrivateRoutes = [
  {
    title: "Dashboard",
    Component: MentorDashboard,
    path: "/dashboard",
  },
  {
    title: "View Students",
    Component: ViewStudents,
    path: "/viewstudents",
  },
  {
    title: "Attendance Home page",
    Component: AttendanceHome,
    path: "/att",
  },
  {
    title: "View Attendance records",
    Component: Records,
    path: "/attrecords",
  },
  {
    title: "View registered users",
    Component: RegisteredUsers,
    path: "/attregusers",
  },
  {
    title: "Register new face",
    Component: Register,
    path: "/attregister",
  },
  {
    title:"Mark attendance",
    Component:FaceAttendance,
    path:"/markatt"
  }
];

export const AdminRoutes = [
  {
    title: "Dashboard",
    Component: AdminDashboard,
    path: "/dashboard",
  },
  // {
  //   title: "Pin",
  //   Component: Pin,
  //   path: "/pin",
  // },
  {
    title: "Mentor SignUp",
    Component: MentorSignUp,
    path: "/signup",
  },
  {
    title: "View Students",
    Component: ViewStudents,
    path: "/viewstudents",
  },
  {
    title: "View Mentors",
    Component: ViewMentors,
    path: "/viewmentors",
  },
  {
    title: "Create Couse",
    Component: CreateCourse,
    path: "/createcourse",
  },
  {
    title: "Courses",
    Component: Courses,
    path: "/courses"
  },
  {
    title: "View Courses",
    Component: AdminCoursesDetails,
    path: "/viewcourses"
  }
];

export default { ROUTES, studentPrivateRoutes, studentPublicRoutes, mentorPublicRoutes, mentorPrivateRoutes, AdminRoutes };