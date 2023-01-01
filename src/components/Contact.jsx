import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-toastify";

export default function Contact({ userRef, listing }) {
  // we define a piece of state here using useState
  const [landlord, setLandlord] = useState(null); //null because we don't have it initially, but if the person exists, we're going to use useLandlord to change it
  const [message, setMessage] = useState("");

  //we need to use useEffect hook the take the information from the database
  //1. check if the landlord exists
  //2. if exists we need to get it's name and email to use it inside for contacting
  useEffect(() => {
    // because we use the database we need to use await - returning a promise
    // we need to use async function
    // for creating an async function, we can't do it as async useEffect
    async function getLandlord() {
      //creating a reference of our database that we want to fetch
      const docRef = doc(db, "users", userRef); //use the doc from firestore, which gets the db which is coming from the firebase file, and the collection we want to get the info is 'users', and the data for the user is userRef
      // userRef we get it like this:
      //- we have the userRef inside the Listing.jsx, and inside the Listing information we have the userData
      //- we can pass this data as a prop when we are calling Contact component inside Listing.jsx
      //- we want to pass the listing too, as a prop, because we want to get the listing information
      //- get them as props inside Contact.jsx through destructuring

      //we can use now the getDoc, which is coming from firestore, which takes the address(docRef) to get us the snapshot of the document
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setLandlord(docSnap.data());
      } else {
        toast.error("Could not get Landlord data");
      }
    }
    getLandlord();
  }, [userRef]);
  //creating a function that gets an event, and after we set the message state to event.target.value which is coming from the form, and then whatever is written in the textarea is going to be save in the message piece of state
  function onChange(event) {
    setMessage(event.target.value);
  }

  return (
    <>
      {/* if the landlord exists */}
      {landlord !== null && (
        <div className="flex flex-col w-full">
          <p>
            {/* showing who can be contacted for the specific listing  */}
            Contact {landlord.name} for the {listing.name.toLowerCase()}
          </p>
          <div className="mt-3 mb-6">
            <textarea
              name="message"
              id="message"
              rows="2"
              value={message}
              onChange={onChange}
              className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:gray-700 focus:bg-white focus:border-slate-600"
            ></textarea>
          </div>
          {/* creating a button that redirects the person to mail of the owner */}
          <a
            href={`mailto:${landlord.email}?Subject=${listing.name}&body=${message}`}
          >
            <button
              type="button"
              className="px-7 py-3 bg-blue-600 text-white rounded text-sm uppercase shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out w-full text-center mb-6"
            >
              Send Message
            </button>
          </a>
        </div>
      )}
    </>
  );
}
