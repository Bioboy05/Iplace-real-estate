import React from "react";
//importing the Outlet for adding the children inside this and Navigate to redirect the person the the Sign In page
import { Outlet, Navigate } from "react-router-dom";
import {useAuthStatus} from "../hooks/useAuthStatus";

export default function PrivateRoute() {
  //instead of bellow dummy data, the returning {loggedIn, checkingStatus} data from the custom useAuthStatus hook
  //   const loggedIn = false;
  const {loggedIn, checkingStatus} = useAuthStatus()
  if(checkingStatus) { //if checkingStatus is true = we get the information => Loading is rendered
    return <h3>Loading...</h3>
  } 

  //otherwise if the login is true, everything inside the Profile is going to be returned, using Outlet from react-router-dom, if not the person is redirected to sign-in page using Navigate to, which is different from useNavigate hook, it's going to directly redirect the person to the place we want. This parameter we need to add now in the App.js and is going to surround the components we want to be private
  return loggedIn ? <Outlet /> : <Navigate to="/sign-in" />;
}
