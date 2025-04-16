const express = require("express");
const { db } = require("../Database/DBconfig");
const transporter = require("../Utils/sendEmail");
const sessionTokens = new Map();  // Store active attendance sessions
const http = require("http"); // Required for socket.io
const { Server } = require("socket.io");
const crypto = require("crypto"); // To generate secure tokens

const app = express();
app.use(express.json());

const enrollCourse = async (req, res) => {
  try {
    const email = req.body.email
    const existingStudentObject = await db.query(
      "SELECT * FROM batch WHERE student_id = $1 AND course_id = $2",
      [req.body.student_id, req.body.course_id]
    );
    const existingStudent = existingStudentObject.rows;
    if (existingStudent.length > 0) {
      return res
        .status(401)
        .json({
          success: false,
          message: "You are already enrolled in this course",
        });
    }
    const courseObject = await db.query(
      "SELECT course_name, mentor_id FROM course WHERE course_id = $1",
      [req.body.course_id]
    );
    const courseDetails = courseObject.rows[0];
    if (courseDetails) {
      await db.query(
        "INSERT INTO batch (batch_name, course_id, student_id, mentor_id) VALUES ($1, $2, $3, $4)",
        [
          courseDetails.course_name,
          req.body.course_id,
          req.body.student_id,
          courseDetails.mentor_id,
        ]
      );
      await db.query(
        "INSERT INTO payment (course_id, student_id, amount, payment_date) VALUES ($1, $2, $3, NOW())",
        [req.body.course_id, req.body.student_id, req.body.amount]
      );

      await db.query(
        "INSERT INTO progress (course_id, student_id, class_finished,class_attended) VALUES ($1, $2,0,0)",
        [req.body.course_id, req.body.student_id]
      );
      return res
        .status(201)
        .json({ success: true, message: "Enrolled successfully!" });
      // const options = {
      //   from: {
      //     name: "Web Admin",
      //     address: process.env.EMAIL_USER,
      //   },
      //   to: email,
      //   subject: "E-learning course enrollment",
      //   html: `<h2>E-learning</h2>
      //         <h3>Enrollment successful for the course : ${courseDetails.course_name}</h3>
      //       `,
      // };
      // // Send Email
      // transporter.sendMail(options, function (err, info) {
      //   if (err) {
      //     console.log(err)
      //     return res
      //       .status(404)
      //       .json({ success: false, message: "Course enrollment failed" });
      //   } else {
      //     return res
      //       .status(201)
      //       .json({ success: true, message: "Enrolled successfully!" });
      //   }
      // });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getStudentCourse = async (req, res) => {
  try {
    const CourseObject = await db.query(
      "SELECT course_id FROM batch where student_id= $1",
      [req.body.student_id]
    );
    const courses = CourseObject.rows;
    if (courses) {
      return res.status(200).json({
        success: true,
        message: "CoursesData fetched successfully",
        course_id: courses,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Something went wrong! CoursesContent not fetched",
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getStudent = async (req, res) => {

  try {
    const studentObject = await db.query("SELECT student_name,batch_name,s.student_id,phone,email FROM STUDENT s join batch b on b.student_id=s.student_id");
    const students = studentObject.rows;
    if (students) {
      return res.status(200).json({ success: true, message: "Students fetched successfully", data: students });
    } else {
      return res.status(500).json({ success: false, message: "Something went wrong!" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, });
  }
}

const getStudentById = async (req, res) => {
  const { id } = req.params;
  try {
    const studentObject = await db.query(
      `SELECT student_name, batch_name, s.student_id, phone, email 
       FROM STUDENT s 
       JOIN batch b ON b.student_id = s.student_id 
       WHERE b.course_id = $1`,
      [id]
    );
    const students = studentObject.rows;
    if (students) {
      return res.status(200).json({ success: true, message: "Students fetched successfully", data: students });
    } else {
      return res.status(500).json({ success: false, message: "Something went wrong!" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, });
  }
}

const getMentor = async (req, res) => {
  try {
    const mentorObject = await db.query("SELECT mentor_name,mentor_id,phone,email,course FROM mentor");
    const mentors = mentorObject.rows;
    if (mentors) {
      return res.status(200).json({ success: true, message: "Mentors fetched successfully", data: mentors });
    } else {
      return res.status(500).json({ success: false, message: "Something went wrong!" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, });
  }
}

const getStudentByCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const studentObject = await db.query("SELECT student_name,s.student_id FROM STUDENT s join batch b on b.student_id=s.student_id where b.course_id=$1", [id]);
    const students = studentObject.rows;
    if (students) {
      return res.status(200).json({ success: true, message: "Students fetched successfully", data: students });
    } else {
      return res.status(500).json({ success: false, message: "Something went wrong!" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, });
  }
}

//added startattendance
const startAttendance = (req, res) => {
  const { courseId } = req.body;
  const io = req.app.get('io');

  if (!courseId) {
    return res.status(400).json({ message: "Course ID is required" });
  }

  const token = crypto.randomBytes(16).toString("hex");
  sessionTokens.set(courseId, { token, expiresAt: Date.now() + 5 * 60 * 1000 });

  // Notify students in the course
  // courseId is in string!
  console.log("Emitting attendanceStarted for course:", courseId);
  console.log("Active rooms at attendance start:", io.sockets.adapter.rooms);
  console.log("Clients in room:", io.sockets.adapter.rooms.get(String(courseId)));
  io.to(courseId.toString()).emit("attendanceStarted", { token });

  return res.json({ success: true, message: "Attendance started", token });
};


const updateAttendance = async (req, res) => {
  const { token, student_ids, course_id } = req.body;

  // Check if course_id exists
  if (!course_id) {
    return res.status(400).json({ success: false, message: "Course ID is required" });
  }

  // Check if session exists
  if (!sessionTokens.has(course_id)) {
    return res.status(403).json({ success: false, message: "Attendance not active" });
  }

  const session = sessionTokens.get(course_id);

  // Validate token and expiration
  if (session.token !== token) {
    return res.status(403).json({ success: false, message: "Invalid token" });
  }

  if (Date.now() > session.expiresAt) {
    sessionTokens.delete(course_id); // Expired session should be removed
    return res.status(403).json({ success: false, message: "Token expired" });
  }

  try {
    for (const student_id of student_ids) {
      const incrementBoth = student_ids[student_id] === "1";
      await db.query("CALL update_class_attendance($1, $2, $3)", [student_id, course_id, incrementBoth]);
    }
    return res.status(200).json({ success: true, message: "Attendance updated for all students" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//getting attendance token
const getAttendanceToken = (req, res) => {
  const { courseId } = req.params;

  if (!sessionTokens.has(courseId)) {
    return res.status(403).json({ message: "Attendance not started" });
  }

  return res.json({ success: true, token: sessionTokens.get(courseId).token });
};


const getAttendance = async (req, res) => {
  try {
    const Object = await db.query("SELECT attendance,class_finished FROM Progress  where course_id=$1 and student_id = $2", [req.body.course_id, req.body.student_id]);
    const data = Object.rows[0];
    if (data) {
      return res.status(200).json({ success: true, message: "Attendance fetched successfully", data: data });
    } else {
      return res.status(500).json({ success: false, message: "Something went wrong!" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, });
  }
}

module.exports = { enrollCourse, getStudentCourse, getStudent, getMentor, getStudentByCourse, updateAttendance, getAttendance, startAttendance, getAttendanceToken, getStudentById};