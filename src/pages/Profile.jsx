import { getAuth, updateProfile } from "firebase/auth"; //imported updateProfile for updating the authentication
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore"; //this two for updating the database
import React, { useEffect, useState } from "react";
import { FcHome } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; //to create the notification for a possible error and success
import ListingItem from "../components/ListingItem";
import { db } from "../firebase";

export default function Profile() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [changeDetails, setChangeDetails] =
    useState(false); /*false, because firstly we don't have any change,
  but when we click on Edit, we will make it opposite*/
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
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

  //will create a useEffect with whom will catch the data once the profile page is loaded
  // useEffect will call a function, and will add some dependencies, [] -means load just one time inside the useEffect, so when the page is loaded call this function
  //will create an async function inside the useEffect
  useEffect(() => {
    async function fetchUserListings() {
      //creating a reference which is like an address for this listing
      const listingRef = collection(db, "listings");
      // after the reference we create a query. we want to take the listings that the person created, not the other listings
      //use the query method from the firestore, and it is going to get a few things:
      //1. listingRef
      //2. we want to say where we want to get listingRef - where from firestore
      //3. the place where we want to get is userRef that we added to the listing
      //4. userRef should be equal to the auth.currentUser.uid
      //5. then sort it by time using orderBy which is coming from firestore, in a descending way

      const q = query(
        listingRef,
        where("userRef", "==", auth.currentUser.uid),
        orderBy("timestamp", "desc")
      );
      //after we made the query, we can use getDocs to get the document
      //created a const that makes a snapshot, and use await to use the getDocs from firestore
      //to getDocs we will pass the query we have created

      const querySnap = await getDocs(q);

      //we can create a listings list, and we can loop through above querySnap, then add that listing data to this listings variable, then use the variable to show it the website
      let listings = [];

      //loop through the querySnap with forEach, because we need each document that is fetched
      //we return that listings, and then push each document inside this listings array
      //we're going to push an object each time
      //we want to get the id which is coming from doc.id, and data from doc.data

      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      //we now have all the data from listings, so we need to put it inside a hook called listings,setListings
      //when we fetch the data and added it to the listings we can setLoading to false add the end
      setListings(listings);
      setLoading(false);
    }

    //call the function here
    fetchUserListings();
  }, [auth.currentUser.uid]); //so each time the authorization of person is changed the useEffect is going to be triggered and the new data will be fetched

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
          {/* When click on this button, redirecting on listing page */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white uppercase px-7 py-3 text-sm font-medium rounded shadow-md hover:bg-blue-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-blue-800"
          >
            <Link
              to="/create-listing"
              className="flex justify-center items-center"
            >
              <FcHome className="mr-2 text-3xl bg-red-200 rounded-full p-1 border-2" />
              Sell or rent your home
            </Link>
          </button>
        </div>
      </section>
      <div className="max-w-6xl px-3 mt-6 mx-auto">
        {/* if the loading is true we don't want to see this section */}
        {!loading && listings.length > 0 && (
          <>
            <h2 className="text-2xl text-center font-semibold mb-6">
              My Listings
            </h2>
            {/* we want to make an ul for the listing we have and insert the breakpoints using grid */}
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 mt-6 mb-6">
              {/* inside the ul, we want to loop with .map through the listings and return a component, and being a map we need a key, otherwise will get an error */}
              {listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  id={listing.id}
                  listing={listing.data}
                />
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
