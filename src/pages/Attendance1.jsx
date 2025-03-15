import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";

const { VITE_BACKEND_URL } = import.meta.env;

const Attendance1 = () => {
  const webcamRef = useRef(null);
  const [result, setResult] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  let captureInterval = useRef(null);

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

  // Capture Frame and Send to Backend
  const captureFrame = async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const imageFile = dataURLtoFile(imageSrc, "frame.jpg");
    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const response = await fetch(`${VITE_BACKEND_URL}/attendance`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setResult(data); // Update UI with recognized names
    } catch (error) {
      console.error("Error recognizing faces:", error);
    }
  };

  // Start Capturing Video Frames
  const startCamera = () => {
    setIsCapturing(true);
    captureInterval.current = setInterval(captureFrame, 500); // Capture every 500ms
  };

  // Stop Capturing Video Frames
  const stopCamera = () => {
    setIsCapturing(false);
    clearInterval(captureInterval.current);
  };

  useEffect(() => {
    return () => clearInterval(captureInterval.current); // Cleanup on unmount
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-6">
      <h2 className="text-3xl font-semibold text-blue-900 mb-6">Real-Time Attendance</h2>
      <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="w-80 h-60 rounded-lg shadow-md border-2" />

      <div className="mt-4">
        {!isCapturing ? (
          <button onClick={startCamera} className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700">
            Start Camera
          </button>
        ) : (
          <button onClick={stopCamera} className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700">
            Stop Camera
          </button>
        )}
      </div>

      {/* Show Recognized Faces */}
      {result.length > 0 && (
        <div className="mt-6 p-4 bg-white shadow-lg rounded-lg text-center">
          <h3 className="text-lg font-bold">Recognized Faces:</h3>
          {result.map((person, index) => (
            <p key={index} className={`text-md ${person !== "Unknown" ? "text-green-600" : "text-red-600"}`}>
              {person} - Marked Attendance
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default Attendance1;
