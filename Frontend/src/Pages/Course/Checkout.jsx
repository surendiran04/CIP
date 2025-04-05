import React, { useState } from "react";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { Link, useParams } from "react-router-dom";
const { VITE_BACKEND_URL } = import.meta.env;
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthContext } from "../../Contexts/AuthContext";
import { useCourseContext } from "../../Contexts/CourseContext";

function Checkout() {

  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuthContext();



  let notify = () => { };

  const { id } = useParams();

  const { courseContent, isContentLoading } = useCourseContext();




  let content = courseContent?.filter((ele) => {
    return ele.course_id == id;
  });
  content = { ...content[0] };



  const onSubmit = (data) => {
    console.log(content.course_id, user.student_id);
    makePayment();
  };

  const makePayment = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${VITE_BACKEND_URL}/enrollCourse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ course_id: content.course_id, student_id: user.student_id, amount: content.fees, email: content.email }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
        // navigate('/');
      } else {
        toast.info(result.message);
      }
    } catch (error) {
      toast.error(error.message);

    }
    finally {
      setIsLoading(false);
    }
  };

  function composeFunctions(...funcs) {
    return () => {
      funcs.forEach(func => func());
    };
  }
  const combinedFunction = composeFunctions(onSubmit, notify);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-gray-100 min-h-screen p-10">
      <div className="flex items-center justify-center">
        <div className="w-full max-w-lg p-6 bg-blue-900 rounded-lg shadow-lg">
          {/* Checkout Heading */}
          <h2 className="text-4xl font-bold text-white text-center mb-6">CHECKOUT</h2>

          {/* Course Details */}
          <div className="text-white">
            <h1 className="text-3xl font-semibold mb-4">{content.course_name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <p className="text-2xl">Price:</p>
              <div className="flex items-center">
                <FaIndianRupeeSign className="text-2xl" />
                <span className="text-2xl text-gold1 font-bold">{content.fees}</span>
              </div>
            </div>

            <div className="bg-gray-700 p-3 rounded-md mb-4">
              <h4 className="text-xl">Duration: {content.duration}</h4>
            </div>

            {/* Payment Button */}
            <button
              className={`w-full py-3 text-xl font-semibold rounded-lg transition duration-300 ease-in-out ${isLoading
                ? "bg-green-500 cursor-not-allowed opacity-75"
                : "bg-green-600 hover:bg-green-500"
                } text-white shadow-lg`}
              type="submit"
              disabled={isLoading}
              onClick={combinedFunction}
            >
              {isLoading ? "Processing..." : "Make Payment"}
            </button>
          </div>
        </div>
      </div>
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
        transition:Bounce
      />
    </div>
  );
}

export default Checkout;
