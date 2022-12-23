import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Header() {

  //to make Sign in button dynamic, we make a hook
  const [pageState, setPageState] = useState("Sign in"); // initial value should be Sign in if the person is not authenticated, but when the person signs in, the Header should change in Profile instead of Sign in

  const location = useLocation();
  function pathMatchRoute(route) {
    //if for example the forward slash/ is equal to the location pathname we are getting from the useLocation from react-router-dom then this is going to be true, otherwise false, because it doesn't exist
    if (route === location.pathname) {
      return true;
    }
  }
  const navigate = useNavigate();
  // initialize the authentication
  const auth = getAuth();

  //after we get the auth, we want to useEffect to check the changes of auth
  //we have to call a function each time this auth changes, so we need to add the auth for the dependencies
  useEffect(() => {
     
    //use onAuthStateChanged from firebase to track the changes in the authentication
    //this function will take the auth and gives us the user state
    onAuthStateChanged(auth, (user) => {
      if (user) {
        //if user exists
        setPageState("Profile"); //we set the page to Profile
      } else {
        setPageState("Sign in"); //otherwise to Sign in
      }
    });
  }, [auth]);

  return (
    <div className="bg-white border-b shadow-lg sticky top-0 z-50">
      <header className="flex justify-between items-center px-3 max-w-6xl mx-auto">
        <div
          className="flex items-center text-lg cursor-pointer font-bold"
          onClick={() => navigate("/")}
        >
          <img
            src="https://vivariomarrecife.com.br/wp-content/uploads/2019/08/wiseitTemp5034847059619032246.png"
            alt="logo"
            className="h-11 cursor-pointer"
            onClick={() => navigate("/")}
          />
          <div>Find your place</div>
        </div>
        <div>
          <ul className="flex space-x-10">
            <li
              className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ${
                pathMatchRoute("/") && "text-black border-b-amber-500"
              }`}
              onClick={() => navigate("/")}
            >
              Home
            </li>
            <li
              className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ${
                pathMatchRoute("/offers") && "text-black border-b-amber-500"
              }`}
              onClick={() => navigate("/offers")}
            >
              Offers
            </li>
            <li
              className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ${
                //if we are in the Sign in page or in the Profile page
                //we want the border button to be amber
                (pathMatchRoute("/sign-in") || pathMatchRoute("/profile")) &&
                "text-black border-b-amber-500"
              }`}
              onClick={() => navigate("/profile")} //redirect the person to Profile page otherwise Sign in 
            >
              {/* making the button dynamic */}
              {pageState}   
            </li>
          </ul>
        </div>
      </header>
    </div>
  );
}
