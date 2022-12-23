import { getAuth, updateProfile } from "firebase/auth"; //imported updateProfile for updating the authentication
import { doc, updateDoc } from "firebase/firestore"; //this two for updating the database
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; //to create the notification for a possible error and success
import { db } from "../firebase";

export default function Profile() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [changeDetails, setChangeDetails] =
    useState(false); /*false, because firstly we don't have any change,
  but when we click on Edit, we will make it opposite*/
  const [formData, setFormData] = useState({
    //Won't work directly, because the page is rendering before the data that is coming from firebase, we get an error because we need to wait until the data has come from the auth, so we add a middleman
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  });
  const { name, email } = formData; //destructured the name and email from the formData
  function onLogOut() {
    //this is a function for Logging out the person
    auth.signOut(); //use this to log out the person
    navigate("/"); //and navigate him to Homepage after logging out
  }

  //this fct is going track the changes from the input, and it's getting the event. Firstly we have to set the form data and we get the previous state, and we need to return an object. We have to keep the previous state, so we need to spread prevState, and the id (which is name) should be equal with the new value that has changed, so the new value will be applied to setFormData, and will update the name and email based on the form
  function onChange(event) {
    setFormData((prevState) => ({
      ...prevState,
      [event.target.id]: event.target.value,
    }));
  }

  //With onSubmit fct we're going to add the change to the database
  async function onSubmit() {
    //checking if the name is changed, in order to submit the change
    try {
      if (auth.currentUser.displayName !== name) {
        //update the display name in firebase auth using the updateProfile special method from firebase
        //being a promise we get from firebase we use await making the function async
        await updateProfile(auth.currentUser, {
          //this is getting the current user then we want to change the displayName with name that is coming from the formDate
          displayName: name,
        });

        //after that, we update the name in the firestore
        //first creating the user reference. Need to use the doc, that comes from firestore, which is going to take 3 things: db, the collection name (users) and the user unique id
        const docRef = doc(db, "users", auth.currentUser.uid);

        //created the reference and now, using it to update the document
        //using updateDoc from firestore which is going to return a promise, so we need to use await
        //this is taking two things: the docRef, and the second thing is the change we want to apply, which is name
        await updateDoc(docRef, {
          name, //we change the name with name, that comes from formData, but because is the same thing we could write only name,
        });
      }
      toast.success("Profile details updated");
    } catch (error) {
      toast.error("Could not update the profile details");
    }
  }
  return (
    <>
      <section className="flex flex-col justify-center items-center mx-auto max-w-6xl">
        <h1 className="text-3xl text-center mt-6 font-bold">My Profile</h1>
        <div className="w-full md:w-[50%] mt-6 px-3">
          <form>
            {/* Name input */}
            <input
              type="text"
              id="name"
              value={name}
              disabled={!changeDetails} //making disabled to false when using changeDetails,
              //because it's set tot true, so the input could be edited
              onChange={onChange} //we have to have onChange to track the change, and this onChange will call a function called onChange
              //the styling of the 1st input will be dynamic. Changing the bg color to red-200, when we click Edit button
              className={`mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out ${
                changeDetails && "bg-red-200 focus:bg-red-200"
              }`}
            />

            {/* Email input */}
            <input
              type="email"
              id="email"
              value={email}
              disabled
              className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border-gray-300 rounded transition ease-in-out"
            />
            <div className="flex justify-between whitespace-nowrap text-sm sm:text-lg mb-6">
              <p className="flex items-center ">
                Do you want to change your name?
                <span
                  // if the changeDetails is true, we want to call onSubmit function, and then we change the setChangeDetails to the previous state
                  onClick={() => {
                    changeDetails && onSubmit();
                    setChangeDetails((prevState) => !prevState);
                  }}
                  /*this is going to change the hook changeDetails, into the opposite of previous state,
                and if this is applied, the form is going to be submitted  */
                  className="text-red-600 hover:text-red-700 transition ease-in-out duration-200 ml-1 cursor-pointer"
                >
                  {/* the Edit button is going to be dynamic */}
                  {changeDetails ? "Apply change" : "Edit"}
                </span>
              </p>
              <p
                onClick={onLogOut}
                className="text-blue-600 hover:text-blue-800 transition ease-in-out duration-200 cursor-pointer"
              >
                Sign out
              </p>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
