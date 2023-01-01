import { doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { FaBath, FaBed, FaMapMarkerAlt, FaParking } from "react-icons/fa";
import { IoMdShareAlt } from "react-icons/io";
import { MdChair } from "react-icons/md";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useParams } from "react-router-dom";
import SwiperCore, {
  Autoplay,
  EffectFade,
  Navigation,
  Pagination,
} from "swiper";
import "swiper/css/bundle";
import { Swiper, SwiperSlide } from "swiper/react";
import Spinner from "../components/Spinner";
import { db } from "../firebase";
import Contact from "../components/Contact";

export default function Listing() {
  const auth = getAuth();
  const params = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  //we use this hook to change the status of this
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  //in order to use the ContactLandlord component we create a hook. False because we don't want to see the contact form first
  const [contactLandlord, setContactLandlord] = useState(false);
  SwiperCore.use(Autoplay, Navigation, Pagination);
  useEffect(() => {
    //we need to have a function to get the data
    //the function must be async because we need to return a promise using await for the firebase methods
    async function fetchListing() {
      //1. create a reference (or address) for that listing
      //2. the const will get the doc which is coming from the firestore
      //3. doc will get 3 things: db(database)-from firebase.js, the collection number 'listings', and the Id using params to get the Id from the URL in the App.js
      const docRef = doc(db, "listings", params.listingId);
      //4. after the reference we need to get the snapshot of data from the firestore using a constant
      const docSnap = await getDoc(docRef);
      //5.we use exists method to see if docSnap exists,
      //6.than use the hook setListing
      if (docSnap.exists()) {
        //7. setListing to that snapshot we are getting
        setListing(docSnap.data());
        setLoading(false);
      }
    }
    //calling this function here because we can't change the useEffect function to be async, so we made an async function inside and called it at the bottom
    fetchListing();
  }, [params.listingId]);
  if (loading) {
    return <Spinner />;
  }
  
  return (
    <main>
      <Swiper
        slidesPerView={1}
        navigation
        pagination={{ type: "progressbar" }}
        effect="fade"
        modules={[EffectFade]}
        autoplay={{ delay: 3000 }}
      >
        {/* looped through the images. We got the url and index. 
        use index for the key,and for adding the background image to this div */}
        {listing.imgUrls.map((url, index) => (
          <SwiperSlide key={index}>
            <div
              className="relative w-full overflow-hidden h-[300px]"
              style={{
                background: `url(${listing.imgUrls[index]}) center no-repeat`,
                backgroundSize: "cover",
              }}
            ></div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div
        className="fixed top-[13%] right-[3%] z-10 bg-white cursor-pointer border-2 border-gray-400 rounded-full w-12 h-12 flex justify-center items-center"
        //this onClick event listener is going to copy the link of the page
        onClick={() => {
          //call a function which is having:
          //navigator - which is contained in javascript already, no need to import it
          //clipboard.writeText - copy a text
          //the text - window.location.href
          navigator.clipboard.writeText(window.location.href);
          setShareLinkCopied(true);
          //keep the message up for only 2 sec
          setTimeout(() => {
            setShareLinkCopied(false);
          }, 2000);
        }}
      >
        <IoMdShareAlt className="text-xl text-slate-500" />
      </div>
      {shareLinkCopied && (
        <p className="fixed top-[23%] right-[5%] font-semibold border-2 border-gray-400 rounded-md bg-white z-10 p-2">
          Link Copied
        </p>
      )}
      <div className="m-4 flex flex-col md:flex-row max-w-6xl lg:mx-auto p-4 rounded-lg shadow-lg bg-white lg:gap-5 ">
        <div className="w-full">
          <p className="text-2xl font-bold mb-3 text-amber-900">
            {listing.name} - €{" "}
            {listing.offer
              ? listing.discountedPrice
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              : listing.regularPrice
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            {listing.type === "rent" ? " / month" : ""}
          </p>
          <p className="flex items-center mt-6 mb-3 font-semibold ">
            <FaMapMarkerAlt className="text-green-700 mr-1" />
            {listing.address}
          </p>
          <div className="flex justify-start items-center gap-4 w-[75%]">
            <p className="bg-red-800 w-full max-w-[200px] rounded-md p-1 text-white text-center font-semibold shadow-md">
              {/* show the correct listing type */}
              {listing.type === "rent" ? "Rent" : "Sale"}
            </p>
            {/* if listing.offer is true we want to add another p which is going to show how much discount we have  */}

            {/* so if we have an offer, we want to show the difference  */}
            {listing.offer && (
              <p className="w-full max-w-[200px] bg-green-800 rounded-md p-1 text-white text-center font-semibold shadow-md">
                €
                {(+listing.regularPrice - +listing.discountedPrice)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                discount
              </p>
            )}
          </div>
          <p className="mt-3 mb-3">
            <span className="font-semibold ">Description - </span>
            {listing.description}
          </p>

          {/* Added the icons for the characteristics of the house */}
          <ul className="flex items-center gap-2 sm:gap-10 text-sm font-semibold mb-6">
            <li className="flex items-center whitespace-nowrap">
              <FaBed className="text-lg mr-1" />
              {+listing.bedrooms > 1 ? `${listing.bedrooms} Beds` : "1 Bed"}
            </li>
            <li className="flex items-center whitespace-nowrap">
              <FaBath className="text-lg mr-1" />
              {+listing.bathrooms > 1 ? `${listing.bathrooms} Baths` : "1 Bath"}
            </li>
            <li className="flex items-center whitespace-nowrap">
              <FaParking className="text-lg mr-1" />
              {listing.parking ? "Parking spot" : "No Parking"}
            </li>
            <li className="flex items-center whitespace-nowrap">
              <MdChair className="text-lg mr-1" />
              {listing.furnished ? "Furnished" : "Not furnished"}
            </li>
          </ul>
          {/* checking if the currentUser is the owner of this listing, if not, we show a CONTACT LANDLORD button
          1. we have the listing from the hook
          2. the owner is userRef
          3. if the owner of the listing it's not equal with the person who's authorized (current user who's signed in, we use the .uid also
          4. create auth and import getAuth from firebase
          5. in case the page loaded faster than the checking of the auth, 
          we protect it with a question mark, because it allows to safely access properties of an object without having to check for the existence of the object or its properties. In this case, the ?. operator is used to access the uid property of the currentUser object, which may not exist if the user is not authenticated.
          6. adding another condition here: if the contactLandlord is false we can see the button. So when we click the button it disappears*/}

          {listing.userRef !== auth.currentUser?.uid && !contactLandlord && (
            <div className="mt-10">
              {/* adding onClick eventlistener that will call a function that will set Contact Landlord in true */}
              <button
                onClick={() => {
                  setContactLandlord(true);
                }}
                className="px-7 py-3 bg-amber-600 text-white font-medium text-sm uppercase rounded shadow-md hover:bg-amber-700 hover:shadow-lg focus:bg-amber-700 focus:shadow-lg w-full text-center transition duration-150 ease-in-out"
              >
                Contact Landlord
              </button>
            </div>
          )}
          {contactLandlord && (
            <Contact userRef={listing.userRef} listing={listing} />
          )}
        </div>
        <div className="w-full h-[200px] md:h-[400px] z-10 overflow-x-hidden mt-6 md:mt-0 md:ml-2">
          <MapContainer
            center={[listing.geoLocation.lat, listing.geoLocation.lng]}
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={[listing.geoLocation.lat, listing.geoLocation.lng]}
            >
              <Popup>{listing.address}</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </main>
  );
}
