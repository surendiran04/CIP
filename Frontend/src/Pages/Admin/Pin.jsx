import { useState } from "react";
import { useAuthContext } from "../../Contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
const { VITE_BACKEND_URL } = import.meta.env;
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaKey } from "react-icons/fa";
import Lord1 from "../../assets/Admin.png"

export default function Pin() {
  const { setLoggedIn } = useAuthContext();

  let notify = () => toast.warn(errors.pin?.message);

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
    handleLogin(data);
    reset();
  };

  const handleLogin = async (data) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${VITE_BACKEND_URL}/api/auth/adminSignin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success) {
        setLoggedIn(true);
        toast.success(result.message);
        sessionStorage.setItem('user', JSON.stringify(result.user));
        sessionStorage.setItem('_tk', result.token);
        navigate('/admin/dashboard');
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
    <div className="h-full  w-full flex items-center justify-center gap-10 bg-gray-200 ">
      <div>
        <div
          className="text-3xl font-extrabold  text-bl text-center non-italic"
        >
          Admin Login
        </div>
        <div className="p-4">
          <form
            onSubmit={handleSubmit(onSubmit)}
          >

            <div className="flex gap-3  mb-3 py-2 px-5  border-solid border-white bg-white  border-2 ">
              <FaKey className="text-4xl pt-1  pb-0 m-0 " />
              <input
                name="password"
                type={isShow ? "text" : "password"}
                placeholder="Enter your Password "
                className="text-xl text-black border-none outline-none"
                disabled={isLoading}
                {...register("pin", {
                  required: "Pin is required",
                  minLength: { value: 4, message: "pin should be minimum of 4 characters" },
                })}
              />
              <div onClick={toggleState} classname="cursor-pointer text-4xl">
                {isShow ? (
                  <Eye size={32} color={"black"} />
                ) : (
                  <EyeOff size={32} color={"black"} />
                )}
              </div>

            </div>
            <button
              className={`
        w-full
        rounded-xl
         font-bold hover:text-white py-3 px-4 border hover:border-transparent transition duration-500 outline-none mt-5 mb-4 ${isLoading
                  ? "bg-green-400 hover:bg-green-600 text-white"
                  : "bg-transparent border-black border-2 hover:bg-lb text-darkb"
                }`}
              type="submit"
              onClick={notify}
              disabled={isLoading}
            >
              {isLoading ? "Loading" : "Login"}
            </button>
          </form>
          <div className="text-center ">
            <p className="text-black font-semibold text-[18px]">
              Don't know the Pin?{" "}
              <Link
                to="/"
                className="text-blue-700 underline cursor-pointer font-bold "
              >
                Home
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className=" w-1/3 h-3/5 mt-10">
        <img src={Lord1} alt="" />

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
