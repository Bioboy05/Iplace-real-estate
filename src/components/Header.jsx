import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Header() {
  const location = useLocation();
  function pathMathRoute(route) {
    //if for example the forward slash/ is equal to the location pathname we are getting from the useLocation from react-router-dom then this is going to be true, otherwise false, because it doesn't exist
    if (route === location.pathname) {
      return true;
    }
  }
  const navigate = useNavigate();
  return (
    <div className="bg-white border-b shadow-sm sticky top-0 z-50">
      <header className="flex justify-between items-center px-3 max-w-6xl mx-auto">
        <div>
          <img
            src="https://vivariomarrecife.com.br/wp-content/uploads/2019/08/wiseitTemp5034847059619032246.png"
            alt="logo"
            className="h-12 cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>
        <div>
          <ul className="flex space-x-10">
            <li className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ${pathMathRoute('/') && 'text-black border-b-green-500'}`}onClick={() => navigate("/")}>Home</li>
            <li className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ${pathMathRoute('/offers') && 'text-black border-b-green-500'}`}onClick={() => navigate("/offers")}>Offers</li>
            <li className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ${pathMathRoute('/sign-in') && 'text-black border-b-green-500'}`}onClick={() => navigate("/sign-in")}>Sign in</li>
            
          </ul>
        </div>
      </header>
    </div>
  );
}
