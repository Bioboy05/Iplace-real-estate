import React from "react";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";

export default function OAuth() {
  const navigate = useNavigate();
  async function onGoogleClick() {
    //trying to sign the person with a pop-up which is going to get the auth and the provider
    //then we got the user using result.user which is coming as a promise from "signInWithPopup"
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider(); //a method that let's the user use the "Sign in with..."" with a pop-up, making the function return a promise, so it's going to be an async function
      const result = await signInWithPopup(auth, provider); // getting the results from the signInWithPopup and this is going to get the auth and the provider
      const user = result.user;

      //check for the user if he exists or not
      //so it's needed to create a reference for the address, and it will be
      //returning a promise called docSnap. this is going to check all the documents with the user.id, and if it's available we get it inside this docSnap - getting the snapshot
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      //checking if it's available. first checking if docSnap it's not available, we're going to add user to the database. setDoc is going to get the address we used before - "docRef", and add the name, email, and timestamp which is the time which the person is signed up, so this is going to use the serverTimeStamp from the firestore.
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          name: user.displayName,
          email: user.email,
          timestamp: serverTimestamp(),
        });
      }
      //finally the person is redirected to the Homepage
      navigate("/");

      //Here we catch the error using try and catch and throw it using toastify
    } catch (error) {
      toast.error("Could not authorize with Google");
    }
  }
  return (
    //in the button added onClick which adds the "onGoogleClick" function, and changed the type of the button to "button" from "submit" in order to prevent submitting the form
    <button
      type="button"
      onClick={onGoogleClick}
      className="flex items-center justify-center w-full bg-red-700 text-white px-7 py-3 uppercase text-sm font-medium hover:bg-red-800 active:bg-red-900 shadow-md hover:shadow-lg active:shadow-lg transition duration-150 ease-in-out rounded"
    >
      <FcGoogle className="text-2xl bg-white rounded-full mr-2" />
      Continue with Google
    </button>
  );
}
