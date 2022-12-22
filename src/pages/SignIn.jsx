import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import OAuth from "../components/OAuth";
import { async } from "@firebase/util";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false); //don't want to see the password as the default. If the showPassword is false make the type password, if true should be text

  const [formData, setFormData] = useState({
    //created the formData Hook
    email: "",
    password: "",
  });
  const { email, password } = formData; //destructured email & password from the formData, so i can use the email variable inside the form
  const navigate = useNavigate();
  function onChange(event) {
    //this event will give me all the information i'll write in the form
    setFormData((prevState) => ({
      //in order to get the previous letter (previous Data), and keep the previous information
      ...prevState,
      [event.target.id]: event.target.value, //so whatever typing will do, it will be safe in this formData
    }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const auth = getAuth(); //we have the auth now and we have the email & password destructured from the formData from above
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        email,
        password
      ); //obtaining the userCredentials. This is going to get us the auth, email and password
      // if it is successful and it exists, we can go to the Homepage
      if (userCredentials.user) {
        navigate("/");
      }
    } catch (error) {
      toast.error("Bad user credentials");
    }
  }
  return (
    <section>
      <h1 className="text-3xl text-center mt-6 font-bold">Sign in</h1>
      <div className="flex justify-center flex-wrap items-center px-6 py-12 max-w-6xl mx-auto">
        <div className="md:w[67%] lg:w-[50%] mb-12 md:mb-6">
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8a2V5fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60"
            alt="key"
            className="w-full rounded-2xl"
          />
        </div>
        <div className="w-full md:w-[67%] lg:w-[40%] lg:ml-20">
          <form onSubmit={onSubmit}>
            <input
              type="email"
              id="email"
              value={email}
              onChange={onChange}
              placeholder="Email address"
              className=" mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition-ease-in-out"
            />
            <div className="relative mb-6">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={onChange}
                placeholder="Password"
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition-ease-in-out"
              />
              {showPassword ? (
                <AiFillEyeInvisible
                  className="absolute right-3 top-3 text-xl cursor-pointer"
                  onClick={() => setShowPassword((prevState) => !prevState)}
                />
              ) : (
                <AiFillEye
                  className="absolute right-3 top-3 text-xl cursor-pointer"
                  onClick={() => setShowPassword((prevState) => !prevState)}
                />
              )}
            </div>
            <div className="flex justify-between whitespace-nowrap text-sm sm:text-lg">
              <p className="mb-6">
                Don't have an account?
                <Link
                  to="/sign-up"
                  className="text-red-600 hover:text-red-700 transition-duration-200 ease-in-out ml-1"
                >
                  Register
                </Link>
              </p>
              <p>
                <Link
                  to="/forgot-password"
                  className="text-blue-600 hover:text-blue-800 transition-duration-200 ease-in-out"
                >
                  Forgot password?
                </Link>
              </p>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-7 py-3 text-sm font-medium uppercase rounded shadow-md hover:bg-blue-700 transition duration-150 ease-in-out hove:shadow-lg active:bg-blue-800"
            >
              Sign in
            </button>
            <div
              className="my-4 flex items-center before:border-t before:flex-1 before:border-gray-300
          after:border-t after:flex-1 after:border-gray-300"
            >
              <p className="text-center font-semibold mx-4">OR</p>
            </div>
            <OAuth />
          </form>
        </div>
      </div>
    </section>
  );
}
