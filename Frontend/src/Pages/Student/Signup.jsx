import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
const { VITE_BACKEND_URL } = import.meta.env;
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUserGraduate,FaPhoneAlt,FaKey } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import Lord2 from "../../assets/stud_signup.jpg"


export default function SignUp() {

  let notify = () =>
    toast.warn(errors.student_name?.message || errors.email?.message || errors.pass?.message ||errors.phone?.message);

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isShow, setIsShow] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const toggleState = () => {
    setIsShow(!isShow);
  };

  const onSubmit = (data) => {
    handleSignup(data);
    reset();
  };

  const handleSignup = async (data) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${VITE_BACKEND_URL}/api/auth/studentSignUp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
        navigate("/student/login");
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
  return (
    <div  className="h-full w-full flex items-center justify-center gap-10  bg-gray-200">
      <div>
        <div className="text-3xl font-extrabold  text-bl text-center non-italic">
          Student Sign Up
        </div>
        <div className="p-4" >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex gap-3  mb-5 py-2 px-5  border-solid border-white bg-white  border-2 ">
              <FaUserGraduate className="text-4xl pt-1  pb-0 m-0 " />
              <input
                name="name"
                className="text-xl text-black border-none outline-none  "
                placeholder="Enter student Name"
                type="text"
                {...register("student_name", { required: "student name is required" })}
                disabled={isLoading}
              />
            </div>
            <div className="flex gap-3  mb-5 py-2 px-5  border-solid border-white bg-white  border-2 ">
              <FaPhoneAlt className="text-4xl pt-1  pb-0 m-0 "/>
              <input
                className="text-xl text-black border-none outline-none   "
                placeholder="Enter Phone number"
                type="text"
                {...register("phone", { required: "Phone number is required" })}
                disabled={isLoading}
              />
              </div>
            <div className="flex gap-3  mb-5 py-2 px-5  border-solid border-white bg-white  border-2 ">
              <MdEmail className="text-4xl pt-1  pb-0 m-0 " />
              <input
                name="email"
                className="text-xl text-black border-none outline-none   "
                placeholder="Enter your Email"
                type="email"
                {...register("email", { required: "Email is required" })}
                disabled={isLoading}
              />
            </div>
            <div className="flex  gap-3  mb-3 py-2 px-5  border-solid border-white bg-white  border-2">
              <FaKey className="text-4xl pt-1  pb-0 m-0 " />
              <input
                name="password"
                type={isShow ? "text" : "password"}
                placeholder="Enter your Password "
                className="text-xl text-black border-none outline-none"
                disabled={isLoading}
                {...register("pass", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "password should be minimum of 8 characters",
                  },
                })}
              />
              <div onClick={toggleState} classname="cursor-pointer  text-4xl">
                {isShow ? <Eye size={36} /> : <EyeOff size={36} />}
              </div>

            </div>

            <button
              className={`
        w-full
        rounded-xl 
         font-bold hover:text-white py-3 px-4 border hover:border-transparent transition duration-500 outline-none  mt-5 mb-4  ${isLoading
                  ? "bg-green-400 hover:bg-green-600 text-white"
                  : "bg-transparent border-black border-2 hover:bg-lb text-darkb"
                }`}
              type="submit"
              onClick={notify}
              disabled={isLoading}
            >
              {isLoading ? "Loading" : "Sign Up"}
            </button>
          </form>
          <div className="text-center ">
            <p className="text-black font-semibold text-[18px]">
              Already have an account?{" "}
              <Link
                to="/student/login"
                className="text-blue-700 underline cursor-pointer font-bold "
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className=" w-1/3 h-3/5 overflow-hidden">
        <img src={Lord2} alt="" className="w-full h-full object-cover object-center"/>

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
