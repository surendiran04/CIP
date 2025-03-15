import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Attendance from "./pages/Attendance";
import RegisterFace from "./pages/RegisterFace";
import Records from "./pages/Records";
import RegisteredUsers from "./pages/RegisteredUsers";
import Attendance1 from "./pages/Attendance1";
const { VITE_BACKEND_URL } = import.meta.env;

function App() {
  console.log(VITE_BACKEND_URL)
  return (
    <Router>
      <div className="w-full min-h-screen flex flex-col bg-gray-100">
        <Navbar />
        {/* Added padding to prevent navbar overlap */}
        <div className="flex-grow pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/attendance1" element={<Attendance1 />} />
            <Route path="/register" element={<RegisterFace />} />
            <Route path="/records" element={<Records />} />
            <Route path="/registered-users" element={<RegisteredUsers/>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
