import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { IoMdShareAlt } from "react-icons/io";
import { MdChair } from "react-icons/md";
import { FaMapMarkerAlt, FaBed, FaBath, FaParking } from "react-icons/fa";
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

export default function Listing() {
  const params = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  //we use this hook to change the status of this
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
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
      <div className="m-4 flex flex-col md:flex-row max-w-6xl lg:mx-auto p-4 rounded-lg shadow-lg bg-white lg:gap-5">
        <div className="w-full h-[200px] lg-[400px]">
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
              {listing.type === "rent" ? "Rent" : "Sale"}
            </p>
            {/* if listing.offer is true we want to add another p which is going to show how much discount we have  */}
            <p className="w-full max-w-[200px] bg-green-800 rounded-md p-1 text-white text-center font-semibold shadow-md">
              {listing.offer && (
                <p>
                  €
                  {(+listing.regularPrice - +listing.discountedPrice)
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                  discount
                </p>
              )}
            </p>
          </div>
          <p className="mt-3 mb-3">
            <span className="font-semibold ">Description - </span>
            {listing.description}
          </p>
          <ul className="flex items-center gap-2 sm:gap-10 text-sm font-semibold">
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
              {+listing.parking > 1 ? "Parking spot" : "No Parking"}
            </li>
            <li className="flex items-center whitespace-nowrap">
              <MdChair className="text-lg mr-1" />
              {+listing.furnished > 1 ? "Furnished" : "Not furnished"}
            </li>
          </ul>
        </div>
        <div className="bg-blue-300 w-full h-[200px] lg-[400px] z-10 overflow-x-hidden"></div>
      </div>
    </main>
  );
}
