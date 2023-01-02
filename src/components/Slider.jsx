import { collection, limit, orderBy, query, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import Spinner from "../components/Spinner";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { useNavigate } from "react-router-dom";
import SwiperCore, {
  EffectFade,
  Autoplay,
  Navigation,
  Pagination,
} from "swiper";
import "swiper/css/bundle";

export default function Slider() {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  SwiperCore.use([Autoplay, Navigation, Pagination]);
  const navigate = useNavigate();

  //create a useEffect hook to get the information of the first five listings, and only get the first image
  //we want to fetch one time, so we use empty brackets

  useEffect(() => {
    //we're getting a promise from the database using getDocs
    //adding another function because we can't make the useEffect async
    async function fetchListings() {
      //we have to add a reference, which is an address of that place inside the database
      //we want to get the data from the collection called listings
      //we use collection from firestore, which gets the db and the collection name
      const listingsRef = collection(db, "listings");
      //we create a query - q, and use the query method from firestore
      //query is taking the listingRef that we already created, also orderBy method which is coming from firestore, method which will order by time and descending means the one that is created earlier is going to be first, after the orderBy we want to limit (from firestore) that, to 5, otherwise we'll get all of them
      const q = query(listingsRef, orderBy("timestamp", "desc"), limit(5));
      //we get the data using the snapshot using getDocs from firestore, which takes the q already created
      const querySnap = await getDocs(q);
      //after we get the information we create an empty list which will be filled using forEach method
      let listings = [];
      //use forEach to get each of them, which uses the doc, and return listings in which we push each doc as an object
      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      //we call the setListings, and set listings variable inside the state
      setListings(listings);
      setLoading(false);
    }
    fetchListings();
  }, []);

  //if we still getting the data, we see the spinner
  if (loading) {
    return <Spinner />;
  }
  //the case when something happens and there's no listing we return an empty fragment
  if (listings.length === 0) {
    return <></>;
  }
  //and finally we see the slider
  return (
    listings && (
      <>
        <Swiper
          slidesPerView={1}
          navigation
          pagination={{ type: "progressbar" }}
          effect="fade"
          modules={[EffectFade]}
          autoplay={{ delay: 3000 }}
        >
          {listings.map(({ data, id }) => (
            //here in the SwiperSlide we'll have an onclick, which is going to return a function that will navigate the person to that particular listing page
            <SwiperSlide
              key={id}
              onClick={() => navigate(`/category/${data.type}/${id}`)}
            >
              {/* adding a div, where there's nothing inside, but has some style
              which has an dynamic background image */}
              <div
                style={{
                  //we see the first image and show it as the background of the div
                  background: `url(${data.imgUrls[0]}) center, no-repeat`,
                  backgroundSize: "cover",
                }}
                className="relative w-full h-[300px] overflow-hidden"
              ></div>
              {/* we use 2 paragraphs to show the name of the listing and the price */}
              <p className="text-[black] absolute left-1 top-3 font-medium max-w-[90%] bg-[#ffcc33] shadow-lg opacity-90 p-2 rounded-br-3xl rounded-tl-3xl">
                {data.name}
              </p>
              <p className="text-[#ffefef] absolute left-1 bottom-1 font-semibold max-w-[90%] bg-[#903828] shadow-lg opacity-90 p-2 rounded-br-3xl rounded-tl-3xl">
                {/* if the listing has an offer we want to see the discounted price, if not the regular price  */}
                €
                {(data.discountedPrice ?? data.regularPrice)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                {data.type === "rent" && " / month"}
              </p>
            </SwiperSlide>
          ))}
        </Swiper>
      </>
    )
  );
}
//the problem is if we don't add a loading effect, because before the page loaded completely ,we don't have any data, so we'll get an error if we do that
