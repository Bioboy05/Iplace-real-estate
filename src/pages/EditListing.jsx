import React, { useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { getAuth } from "firebase/auth";
import { v4 as uuidv4 } from "uuid"; //with this v4 standard we can use uuidv4 that creates a dynamic name for our storage
import {
  doc,
  addDoc,
  collection,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate, useParams } from "react-router-dom";

export default function EditListing() {
  const auth = getAuth();
  const navigate = useNavigate();

  //this is going to be false by default
  //or true if the location will be set manually
  const [geoLocationEnabled, setGeoLocationEnabled] = useState(true); //it means geoLocation API is enabled
  const [loading, setLoading] = useState(false); //if the loading is true we want to return the spinner
  const [listing, setListing] = useState(null);

  //in order to change the formData, we create a hook to add the default values
  const [formData, setFormData] = useState({
    type: "rent", //initial value for type is rent
    name: "",
    bedrooms: 1, //1 default value, because most homes start with 1
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: "",
    description: "",
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    latitude: 0,
    longitude: 0,
    images: {},
  });

  //we get the type by destructuring formData
  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    description,
    offer,
    regularPrice,
    discountedPrice,
    latitude,
    longitude,
    images,
  } = formData;

  //we create a const that will use the useParams hook (from react-router-dom)
  const params = useParams();

  //this useEffect is going to check if the listing belongs to the person who's editing it
  useEffect(() => {
    //if the id inside the listing is not equal tot he id we're getting from the authentication then toast error
    if (listing && listing.userRef !== auth.currentUser.uid) {
      toast.error("You cannot edit this listing");
      navigate("/");
    }
  }, [auth.currentUser.uid, listing, navigate]);

  // create a useEffect to fetch the listing to edit it
  useEffect(() => {
    //set the loading to be true until the data is fetched
    setLoading(true);
    async function fetchListing() {
      //1. create a reference (or address) for that listing
      //2. the const will get the doc which is coming from the firestore
      //3. doc will get 3 things: db(database), the collection number 'listings', and the Id using params to get the Id from the URL
      const docRef = doc(db, "listings", params.listingId);
      //4. after the reference we need to get the snapshot of data from the firestore using a constant
      const docSnap = await getDoc(docRef); //we use getDoc from firebase/firestore, which will get that reference

      //5.we use exists method to see if docSnap exists,
      //6.than use the hook setListing
      if (docSnap.exists()) {
        //7. setListing to that snapshot we are getting
        setListing(docSnap.data());
        //8. update that formData by the new listing, which is an object
        //9. add all the docSnap in the formData
        setFormData({ ...docSnap.data() });
        setLoading(false); //stop the loading
      } else {
        //if the listing does not exist
        navigate("/"); //navigate the person to the homepage and give them an error
        toast.error("Listing does not exist");
      }
      //now listing is filled
    }
    //calling this function here because we can't change the useEffect function to be async, so we made an async function inside and called it at the bottom
    fetchListing();
  }, [navigate, params.listingId]);

  //implementing a couple of conditions, because we have buttons, text inputs, address inputs, number inputs, images
  function onChange(event) {
    //based on the input, it will be changed to true/false, default being null.
    //Use boolean to change the form states in the formData
    let boolean = null;

    //if the input which is coming from the event is true in string
    if (event.target.value === "true") {
      //we want that boolean variable to be true. Repeating the same thing for false
      boolean = true;
    }
    if (event.target.value === "false") {
      boolean = false;
    }

    //FILES
    //Another situation to be managed is when the input is files
    if (event.target.files) {
      //in this case we want to set the formData
      //firstly we want to keep the changes that happened before, using prevState
      //we keep the prev state by using spread operator and we return an object
      setFormData((prevState) => ({
        //in case we have the files, we set the images to event.target.files
        ...prevState,
        images: event.target.files,
      }));
    }

    //TEXT/BOOLEAN/NUMBER
    //but if we don't have the images, we will handle the situation in a different way
    if (!event.target.files) {
      //we get the prevState, and we return a object, keeping the prevState
      setFormData((prevState) => ({
        ...prevState,
        //this is not a file, so it can be text, nr, boolean...
        //for the nr. and text this is fine, [event.target.id]:event.target.value
        //but for the boolean, if it exists(!null), put it in the event.target.id
        //if it's null we put it in event.target.value
        [event.target.id]: boolean ?? event.target.value, //can't use the && because it only considers the true, but we want true and false to be considered, that's why the ?? operator
      }));
    }
  }

  async function onSubmit(event) {
    //we need to prevent the default behavior of the browser to refresh the page, by getting the event param
    //and use the event.preventDefault
    event.preventDefault();

    //create the loading effect when submitting the form
    //and all the data will be updating the database
    //after everything is done, the spinner is stopped,
    //and the person will be redirected to that particular page
    //in order to do that we'll create a loading hook above

    //first we setLoading to true,
    //after everything is finished we want to set loading to false
    setLoading(true);

    //if we have an offer, we want to have the regular price to be more than the discounted price,
    //and if the condition is not satisfied, we send an error to the user
    if (+discountedPrice >= +regularPrice) {
      setLoading(false);
      toast.error("Discounted price needs to be less than regular price");
      //using return, in order to not continue the rest of the function
      //this error being enough to stop the function
      return;
    }

    //images should be a max of 6
    //if it's more, an error should be sent

    if (images.length > 6) {
      setLoading(false);
      toast.error("Max 6 images are allowed");
      return; //because we don't want to continue this function, if the error happens
    }

    //Enabling the geo location
    let geoLocation = {}; //in this, we're gonna add the lat and long
    let location; //this is gonna be the location we're getting from google API
    //if this is true, we want to fetch data from the API
    if (geoLocationEnabled) {
      //dynamic fetching: address coming from the formData, and the key is the APIkey which we are getting using process.env(the key is in an environment visible only on this pc)
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&&key=${process.env.REACT_APP_GEOCODE_API_KEY}`
      );
      //after this we get the data, and convert it to .json
      const data = await response.json();
      console.log(data);

      //filling geoLocation variable
      //having 2 different results error/lat&lng
      //if not error, we want to go to geometry.location.lat and same for lng
      //if location doesn't exist, we want to have 0
      geoLocation.lat = data.results[0]?.geometry.location.lat ?? 0;
      geoLocation.lng = data.results[0]?.geometry.location.lng ?? 0;

      //we can set now the location above
      location = data.status === "ZERO_RESULTS" && undefined; //the error from API appears as ZERO_RESULTS. if this is true (zero results), set the location as undefined

      //if this above error happens or just in case it includes the word undefined as a string
      //we will set the loading to false - stopping the spinner
      //and then toast an error
      if (location === undefined) {
        setLoading(false);
        toast.error("Please enter a correct address");
        return;
      }
    } else {
      //if geolocationEnabled - we fetch the data, OTHERWISE if it's not finding it
      //we want to get it from the formData, so the inputs of latitude and longitude will appear
      //to introduce them manually
      geoLocation.lat = latitude;
      geoLocation.lng = longitude;
    }

    //this function is helping to upload the image one-by-one to the database, and it's gonna be async
    //because for the upload will be using await as well
    async function storeImage(image) {
      //inside this function we're returning a new Promise
      //this is giving us resolve - if it's successful and reject if not
      return new Promise((resolve, reject) => {
        //first we're getting the storage with getStorage method
        const storage = getStorage();
        //after, will define the filename which is dynamic
        //we want to see who uploads the image - with auth.currentUser.uid
        //we want to upload the name from PC with image.name, and to be a unique image always
        //we want to have some random nr - using a package called UUID
        const filename = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
        //after defining the filename we need to have the storage reference
        const storageRef = ref(storage, filename);
        //after this we need to add the upload task
        const uploadTask = uploadBytesResumable(storageRef, image);
        //after that will use the uploadTask.on method from firebase
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
            // eslint-disable-next-line default-case
            switch (snapshot.state) {
              case "paused":
                console.log("Upload is paused");
                break;
              case "running":
                console.log("Upload is running");
                break;
            }
          },
          (error) => {
            // Handle unsuccessful uploads
            reject(error);
          },
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    }
    //the variable is gonna get a promise, and for the all images
    //we're going to loop through the images and put inside the images
    const imgUrls = await Promise.all(
      //this one is gonna give us each image and for each image we're gonna upload it
      //and call the function storeImage and will pass that image that we have
      //so we get each image and use this function to store it
      //if this is not successful we're gonna catch the error
      //and we're going to setLoading to false
      //and then toast an error
      [...images].map((image) => storeImage(image))
    ).catch((error) => {
      setLoading(false);
      toast.error("Images not uploaded");
      return;
    });

    //we're going to add the images to the formData copy(don't want to change the original one)
    //1. add the imgUrl and geoLocation to the formData
    //2. add the timestamps as well - because we want to know when the person submitted the form and listed the place
    //3. submit them to the database - firestore
    const formDataCopy = {
      ...formData,
      imgUrls,
      geoLocation,
      timestamp: serverTimestamp(),
      userRef: auth.currentUser.uid,
    };

    //now some data is going to be removed
    delete formDataCopy.images;
    //delete the formData discounted price if there's no offer
    //first check if they have an offer or not
    !formDataCopy.offer && delete formDataCopy.discountedPrice;

    //removing lat/lng because the are offered from geolocation
    delete formDataCopy.latitude;
    delete formDataCopy.longitude;

    //after, we submit this formDataCopy to the database
    //so we create a document reference
    const docRef = doc(db, "listings", params.listingId); //document reference is db, listings
    await updateDoc(docRef, formDataCopy); //fetch that listing and fill it with this new formData
    setLoading(false); //end the loading if everything is ok
    toast.success("Listing edited");

    //after, the person will be redirected to the listing page
    //dynamic URL because we want the url to be based on the listing id - rent/sale
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
  }

  if (loading) {
    return <Spinner />;
  }

  return (
    <main className="max-w-md px-2 mx-auto">
      <h1 className="text-3xl text-center mt-6 font-bold">Edit Listing</h1>
      <form onSubmit={onSubmit}>
        <p className="text-lg mt-6 font-semibold">Sell / Rent</p>
        <div className="flex space-x-7">
          {/* This buttons have the type button, they don't do anything. They just change the onChange (tracking the changes) */}
          {/* styling is dynamic, it depends on the type(rent/sell), different bg-color, text-color. Adding the stylings that are common between both of buttons, and then the dynamic ones. */}
          <button
            type="button"
            id="type"
            value="sale"
            onClick={onChange}
            className={`px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              type === "rent"
                ? "bg-white text-black"
                : "bg-slate-600 text-white"
            }`}
          >
            sell
          </button>
          <button
            type="button"
            id="type"
            value="rent"
            onClick={onChange}
            className={`px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              type === "sale"
                ? "bg-white text-black"
                : "bg-slate-600 text-white"
            }`}
          >
            rent
          </button>
        </div>
        <p className="text-lg mt-6 font-semibold">Listing title</p>
        <input
          type="text"
          id="name"
          value={name}
          onChange={onChange}
          placeholder="Name"
          maxLength="32"
          minLength="10"
          required
          className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6"
        />
        <div className="flex space-x-6 mb-6">
          <div>
            <p className="text-lg font-semibold">Beds</p>
            <input
              type="number"
              id="bedrooms"
              value={bedrooms}
              onChange={onChange}
              min="1"
              max="50"
              required
              className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"
            />
          </div>
          <div>
            <p className="text-lg font-semibold">Baths</p>
            <input
              type="number"
              id="bathrooms"
              value={bathrooms}
              onChange={onChange}
              min="1"
              max="50"
              required
              className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"
            />
          </div>
        </div>
        <p className="text-lg mt-6 font-semibold">Parking spot</p>
        <div className="flex space-x-7">
          {/* This buttons have the type button, they don't do anything. They just change the onChange (tracking the changes) */}
          {/* styling is dynamic, it depends on the type(false/true), different bg-color, text-color. Adding the stylings that are common between both of buttons, and then the dynamic ones. */}
          <button
            type="button"
            id="parking"
            value={true}
            onClick={onChange}
            className={`px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              !parking ? "bg-white text-black" : "bg-slate-600 text-white"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            id="parking"
            value={false}
            onClick={onChange}
            className={`px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              parking ? "bg-white text-black" : "bg-slate-600 text-white"
            }`}
          >
            No
          </button>
        </div>
        <p className="text-lg mt-6 font-semibold">Furnished</p>
        <div className="flex space-x-7">
          {/* This buttons have the type button, they don't do anything. They just change the onChange (tracking the changes) */}
          {/* styling is dynamic, it depends on the type(false/true), different bg-color, text-color. Adding the stylings that are common between both of buttons, and then the dynamic ones. */}
          <button
            type="button"
            id="furnished"
            value={true}
            onClick={onChange}
            className={`px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              !furnished ? "bg-white text-black" : "bg-slate-600 text-white"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            id="furnished"
            value={false}
            onClick={onChange}
            className={`px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              furnished ? "bg-white text-black" : "bg-slate-600 text-white"
            }`}
          >
            No
          </button>
        </div>
        <p className="text-lg mt-6 font-semibold">Address</p>
        <textarea
          type="text"
          id="address"
          value={address}
          onChange={onChange}
          placeholder="Address"
          required
          className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6"
        />
        {/* adding a condition. If the geoLocationEnabled is true we want to have this form  */}
        {!geoLocationEnabled && (
          <div className="flex space-x-6 justify-start mb-6">
            <div>
              <p className="text-lg font-semibold">Latitude</p>
              <input
                type="number"
                id="latitude"
                value={latitude}
                onChange={onChange}
                required
                min="-90"
                max="90"
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:bg-white focus:text-gray-700 focus:border-slate-600 text-center"
              />
            </div>
            <div>
              <p className="text-lg font-semibold">Longitude</p>
              <input
                type="number"
                id="longitude"
                value={longitude}
                onChange={onChange}
                required
                min="-180"
                max="180"
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:bg-white focus:text-gray-700 focus:border-slate-600 text-center"
              />
            </div>
          </div>
        )}
        <p className="text-lg font-semibold">Description</p>
        <textarea
          type="text"
          id="description"
          value={description}
          onChange={onChange}
          placeholder="Description"
          required
          className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 mb-6"
        />
        <p className="text-lg font-semibold">Offer</p>
        <div className="flex space-x-7 mb-6">
          {/* This buttons have the type button, they don't do anything. They just change the onChange (tracking the changes) */}
          {/* styling is dynamic, it depends on the type(false/true), different bg-color, text-color. Adding the stylings that are common between both of buttons, and then the dynamic ones. */}
          <button
            type="button"
            id="offer"
            value={true}
            onClick={onChange}
            className={`px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              !offer ? "bg-white text-black" : "bg-slate-600 text-white"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            id="offer"
            value={false}
            onClick={onChange}
            className={`px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              offer ? "bg-white text-black" : "bg-slate-600 text-white"
            }`}
          >
            No
          </button>
        </div>
        <div className="flex items-center mb-6">
          <div>
            {/* Displayed always */}
            <p className="text-lg font-semibold">Regular Price</p>
            <div className="flex w-full justify-center items-center space-x-6">
              <input
                type="number"
                id="regularPrice"
                value={regularPrice}
                onChange={onChange}
                min="50"
                max="400000000"
                required
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"
              />
              {type === "rent" && (
                <div className="">
                  <p className="text-md w-full whitespace-nowrap">$ / Month</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Discounted Price will appear only when we have the offer true in our listing */}
        {offer && (
          <div className="flex items-center mb-6">
            <div>
              <p className="text-lg font-semibold">Discounted Price</p>
              <div className="flex w-full justify-center items-center space-x-6">
                <input
                  type="number"
                  id="discountedPrice"
                  value={discountedPrice}
                  onChange={onChange}
                  min="50"
                  max="400000000"
                  required={offer} //required only if the offer is true
                  className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"
                />
                {type === "rent" && (
                  <div className="">
                    <p className="text-md w-full whitespace-nowrap">
                      $ / Month
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="mb-6">
          <p className="text-lg font-semibold">Images</p>

          {/* It will be permitted only 6 pics, otherwise the form won't be submitted, also accepting only a 3 formats of pics, like a validation directly from here, and one will be from firebase database */}
          <p className="text-gray-600">
            The first image will be the cover (max 6 - under 2 Mb/pic)
          </p>
          <input
            type="file"
            id="images"
            onChange={onChange}
            accept=".jpg,.png,.jpeg"
            multiple
            required
            className="w-full px-3 py-1.5 text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:bg-white focus:border-slate-600"
          />
        </div>
        <button
          type="submit"
          className="mb-6 w-full px-7 py-3 bg-blue-600 text-white font-medium text-sm uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
        >
          Edit Listing
        </button>
      </form>
    </main>
  );
}
