import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

export function useAuthStatus() {
  //not export "default" - because we're returning all the function, we have two things to be exported, not one
  // Adding 2 hooks using useState:
  const [loggedIn, setLoggedIn] = useState(false); //suppose that the person is new, so default is going to be false, afterwards we check if the person is authenticated or not. It becomes true if the person is authenticated.
  const [checkingStatus, setCheckingStatus] = useState(true); //we need some time to get the information from firebase so we need to add another hook to check the status to see if the information came or not, otherwise we need to add some loading effect.

  //Ask firebase if the person is auth or not using useEffect hook, using useEffect which is coming from react
  useEffect(() => {
    //1st need to get auth ->initialize it with getAuth which is coming from firebase/auth
    const auth = getAuth();
    //2nd - use another method from firebase/auth called onAuthStateChanged, which is going to take the auth, and give us the user. It will return true/false on the user
    onAuthStateChanged(auth, (user) => {
      //checking if the user exists or not
      if (user) {
        setLoggedIn(true); //person is authenticated
      }
      setCheckingStatus(false); //loading effect is going to finish
    });
  }, []); //call the useEffect hook one time

  return { loggedIn, checkingStatus }; //this info is going to be used inside the PrivateRoute
}
