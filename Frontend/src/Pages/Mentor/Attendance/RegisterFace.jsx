import { useRef, useState } from "react";
import Webcam from "react-webcam";
import { useAuthContext } from "../../../Contexts/AuthContext"; 
import { ToastContainer, toast,Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCourseContext } from "../../../Contexts/CourseContext";


const { VITE_BACKEND_URL1 } = import.meta.env;

const Register = () => {

  const { studentsData } = useCourseContext();

  const webcamRef = useRef(null);
  const { user } = useAuthContext();
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
  };

  const dataURLtoFile = (dataUrl, filename) => {
    let arr = dataUrl.split(",");
    let mime = arr[0].match(/:(.*?);/)[1];
    let bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }
    return new File([u8arr], filename, { type: mime });
  };

  //To help with errors, you can auto-fill name and email from logged-in user or add a dropdown/autocomplete for student selection later.

  const handleSubmit = async () => {
    if (!image || !name || !email) {
      toast.warn("Please enter name, email and capture an image.");
      return;
    }

    const matchedStudent = studentsData.find(
      (student) =>
        student.student_name.toLowerCase() === name.trim().toLowerCase() &&
        student.email.toLowerCase() === email.trim().toLowerCase()
    );
    console.log(matchedStudent)
  
    if (!matchedStudent) {
      toast.info("No matching student found.");
      return;
    }

    const imageFile = dataURLtoFile(image, "register.jpg");
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("name", name);
    formData.append("email", email);
    formData.append("course_id", user?.course_id);
    formData.append("student_id", matchedStudent.student_id);

    setLoading(true);
    try {
      const response = await fetch(`${VITE_BACKEND_URL1}/register_face`, {
        method: "POST",
        body: formData,

      });
      const data = await response.json();
      if(data.success){
        toast.success(data.message);
      }else{
        toast.info(data.message);
      }
      
    } catch (error) {
      console.error("Error registering face:", error);
      toast.error("Failed to register face. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-6">
      
      <h2 className="text-3xl font-semibold text-green-900 mb-6">Register a New Face</h2>

      <input
        type="text"
        placeholder="Enter Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-4 p-2 border border-gray-300 rounded-lg shadow-sm"
      />

      <input
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-4 p-2 border border-gray-300 rounded-lg shadow-sm"
      />

      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="w-80 h-60 rounded-lg shadow-md border-2"
      />

      <button
        onClick={capture}
        className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg text-lg shadow-md hover:bg-blue-700 transition"
      >
        Capture Image
      </button>

      {image && (
        <img
          src={image}
          alt="Captured"
          className="mt-4 w-40 h-40 border-2 rounded-lg shadow-md"
        />
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`mt-4 px-6 py-3 rounded-lg text-lg shadow-md transition ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 text-white hover:bg-green-700"
        }`}
      >
        {loading ? "Registering..." : "Register Face"}
      </button>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />
    </div>
  );
};

export default Register;


