import { useRef, useState } from "react";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthContext } from "../../Contexts/AuthContext";

const { VITE_BACKEND_URL1, VITE_BACKEND_URL } = import.meta.env;

const AdminFaceAttendance = () => {
    const { user } = useAuthContext();
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
  };


  // Convert Data URL to File
  const dataURLtoFile = (dataUrl, filename) => {
    let arr = dataUrl.split(",");
    let mime = arr[0].match(/:(.*?);/)[1];
    let bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleSubmit = async () => {
    if (!image) {
      toast.error("Please capture an image first.");
      return;
    }

    setLoading(true);

    const imageFile = dataURLtoFile(image, "attendance.jpg");
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("course_id",user.course_id);
  

    try {
      const response = await fetch(`${VITE_BACKEND_URL1}/attendance`, {
        method: "POST",
        body: formData,
        
      });
      const data = await response.json();
      setResult(data);
      console.log(data)
      if (data)  {
        const resp = await fetch(`${VITE_BACKEND_URL}/mentorUpdateAttendance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            course_id:user.course_id,
            student_ids: { [data.student_id]: "1" }, // Assuming '1' for both present + class increment
          }),
        });
        const data1 = await resp.json();
        
        if(data1.success){
          toast.success(data1.message);
        }else{
          toast.info(data1.message)
        }
      } else {
        toast.error("Face not recognized or unknown user.");
      }
    } catch (error) {
      toast.error("Error submitting attendance.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-6">

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

      <h2 className="text-3xl font-semibold text-blue-900 mb-6">Mark Attendance</h2>

      <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="w-80 h-60 rounded-lg shadow-md border-2" />

      <button
        onClick={capture}
        className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg text-lg shadow-md hover:bg-blue-700 transition"
      >
        Capture Image
      </button>

      {image && <img src={image} alt="Captured" className="mt-4 w-40 h-40 border-2 rounded-lg shadow-md" />}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`mt-4 px-6 py-3 rounded-lg text-lg shadow-md transition ${
          loading
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-green-600 text-white hover:bg-green-700"
        }`}
      >
        {loading ? "Submitting..." : "Submit Attendance"}
      </button>

      {result && (
        <div className="mt-6 p-4 bg-white shadow-lg rounded-lg text-center">
          <h3 className="text-lg font-bold">{result.name}</h3>
          <p className={`text-md ${result.name !== "Unknown" ? "text-green-600" : "text-red-600"}`}>
            {result.status}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminFaceAttendance;

