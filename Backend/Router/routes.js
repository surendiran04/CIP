const {
  createStudent,
  signInStudent,
  forgotPasswordStudent,
  updatePassStudent
} = require("../Controllers/student_Authentication.controller");

const {
  createMentor,
  signInMentor,
  forgotPasswordMentor,
  updatePassMentor
} = require("../Controllers/mentor_Authentication.controller");

const {
  createCourse,
  deleteCourse,
  getCourse,
  getCourseContent,
  createSession,
  getSession
} = require("../Controllers/course.controller");

const {
  enrollCourse, getStudentCourse,  getStudent,getMentor,getStudentByCourse,updateAttendance,getAttendance,getStudentById
} = require("../Controllers/batch.controller")

const { startAttendance, getAttendanceToken } = require("../Controllers/batch.controller");


const {
  makePayment
} = require("../Controllers/payment.controller")

const {signInAdmin} = require("../Controllers/admin.controller");

const AuthRouter = require("express").Router();
const courseRouter = require("express").Router();

AuthRouter.post("/studentSignUp", createStudent);
AuthRouter.post("/studentSignin", signInStudent);
AuthRouter.post("/studentForgotPassword", forgotPasswordStudent);
AuthRouter.patch("/studentResetPassword/:id/:token", updatePassStudent);

AuthRouter.post("/mentorSignUp", createMentor);
AuthRouter.post("/mentorSignin", signInMentor);
AuthRouter.post("/mentorForgotPassword", forgotPasswordMentor);
AuthRouter.patch("/mentorResetPassword/:id/:token", updatePassMentor);

AuthRouter.post("/adminSignin",signInAdmin);

courseRouter.get("/getStudent", getStudent);
courseRouter.get("/getStudent/:id",getStudentById);
courseRouter.get("/getMentor", getMentor);

courseRouter.post("/createCourse", createCourse);
courseRouter.post("/deleteCourse", deleteCourse);
courseRouter.get("/getCourse", getCourse);
courseRouter.get("/getCourseContent", getCourseContent);
courseRouter.post("/createSession", createSession); 
courseRouter.get("/getSession/:id",getSession); 
courseRouter.post("/getAttendance",getAttendance); //rework

courseRouter.post("/enrollCourse",   enrollCourse);
courseRouter.post("/getStudentCourse", getStudentCourse);  //my courses 
courseRouter.get("/getStudentByCourse/:id", getStudentByCourse);
courseRouter.post("/updateAttendance", updateAttendance ); 

courseRouter.post("/startAttendance", startAttendance); // Mentor starts attendance
courseRouter.get("/getAttendanceToken/:courseId", getAttendanceToken); // Student fetches token

courseRouter.post("/makePayment",  makePayment);



module.exports ={ AuthRouter,courseRouter};