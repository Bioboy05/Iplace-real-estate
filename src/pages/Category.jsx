import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ListingItem from "../components/ListingItem";
import Spinner from "../components/Spinner";
import { db } from "../firebase";

export default function Category() {
  //put the data in a piece of state that we call listings
  //make another piece of state for loading because we need to wait until the data is loaded
  //a third piece of state for the last fetched listing
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchedListing, setLastFetchedListing] = useState(null);

  //we need to get the information for where the offer is rent or sale, from URL and for that we need useParams from react-router-dom
  const params = useParams();

  //create a useEffect to fetch the data
  useEffect(() => {
    //async because we use await getDocs from firestore(returns a promise)
    async function fetchListings() {
      // use try/catch statement to try to get the info, and if there's an error we toast a message
      try {
        //first create the reference
        //which is the address of that collection (uses the collection from firestore)
        //the collection takes two things: db- from firebase.js, then we specify the name of the collection "listings"
        const listingRef = collection(db, "listings");
        //after the reference, we make the query
        //creating a variable q which holds the query method from firestore
        //then query method takes the listing ref we created
        //then tell it where(from firestore) to get it, which is "type" equal to categoryName from App.js
        //we sort it then (orderBy) by time, descending (newest is the first in the list)
        //the limit it to 8 listings
        const q = query(
          listingRef,
          where("type", "==", params.categoryName),
          orderBy("timestamp", "desc"),
          limit(8)
        );
        //we execute the query adding a snapshot called querySnap
        //which holds the await getDocs(from firestore)
        const querySnap = await getDocs(q);

        //inside this useEffect, where we're getting the query
        //we can save the last visible listing
        //the constant holds the querySnap, and get the doc we want using .docs and inside we tell what document to get, so we use the length of all the docs array minus 1 to get the last item - the index starting from 0
        const lastVisible = querySnap.docs[querySnap.docs.length - 1];
        //now, after having the last listing from docs, we set it to the last piece of state that we created(and set it to the lastVisible variable)
        setLastFetchedListing(lastVisible); //now we saved it inside our piece of state, now we can show the button Load More if we have more listings left

        //create the array listings, and loop through querySnap
        const listings = [];
        //the loop is going to give us each document, and set each document to the listing by returning
        //listing.push - which pushes in the array an object which takes the id from doc.id and data from doc.data
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        //we change the value of listings with the setListing state that we set it with the variable listings
        setListings(listings);
        //and finally we se the loading to false
        setLoading(false);
      } catch (error) {
        toast.error("Could not fetch listing");
      }
    }
    fetchListings();
  }, [params.categoryName]);

  //because we will use more fetched data, we'll make the function async for the button
  async function onFetchMoreListings() {
    try {
      //first create the reference
      //which is the address of that collection (uses the collection from firestore)
      //the collection takes two things: db- from firebase.js, then we specify the name of the collection "listings"
      const listingRef = collection(db, "listings");
      //after the reference, we make the query
      //creating a variable q which holds the query method from firestore
      //then query method takes the listing ref we created
      //then tell it where(from firestore) to get it, which is "type" equal categoryName (from App.js) using params
      //we sort it then (orderBy) by time, descending (newest is the first in the list)
      //the limit it to 8 listings
      const q = query(
        listingRef,
        where("type", "==", params.categoryName),
        orderBy("timestamp", "desc"),
        //use the startAfter from firestore, which is going to start from tha lastFetchedListing
        startAfter(lastFetchedListing),
        limit(4)
      );
      //we execute the query adding a snapshot called querySnap
      //which holds the await getDocs(from firestore)
      const querySnap = await getDocs(q);

      //inside this useEffect, where we're getting the query
      //we can save the last visible listing
      //the constant holds the querySnap, and get the doc we want using .docs and inside we tell what document to get, so we use the length of all the docs array minus 1 to get the last item - the index starting from 0
      const lastVisible = querySnap.docs[querySnap.docs.length - 1];
      //now, after having the last listing from docs, we set it to the last piece of state that we created(and set it to the lastVisible variable)
      setLastFetchedListing(lastVisible); //now we saved it inside our piece of state, now we can show the button Load More if we have more listings left

      //create the array listings, and loop through querySnap
      const listings = [];
      //the loop is going to give us each document, and set each document to the listing by returning
      //listing.push - which pushes in the array an object which takes the id from doc.id and data from doc.data
      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      //instead of changing all the listings we'll set the prevState
      //the we want to return an array, and add the new listings that starts from previous lastFetchedListing
      setListings((prevState) => [...prevState, ...listings]);
      //and finally we se the loading to false
      setLoading(false);
    } catch (error) {
      toast.error("Could not fetch listing");
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-3">
      <h1 className="text-3xl text-center mt-6 font-bold mb-6">
        {params.categoryName === "rent" ? "Places for rent" : "Places for sale"}
      </h1>
      {/* if the loading is true the show the spinner */}
      {/* otherwise if the listings exist and there is at least one */}
      {loading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        //otherwise in the empty fragment, we're going to loop through the listings that are fetched from the useEffect
        <>
          <main>
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {/* after the loop we're getting each listing, and we return that
              listing item component that we import */}
              {listings.map((listing) => (
                <ListingItem
                  //the listingItem has a key that is passed from the listing.id
                  //an id that passes the listing.id
                  //finally we pass the data which is equal with listing.data
                  key={listing.id}
                  id={listing.id}
                  listing={listing.data}
                />
              ))}
            </ul>
          </main>
          {/* adding a load more button, when clicked, we're going to fetch more listings from the database */}
          {/* need to add a piece of state that tells us if we reached the information of last listing, and we fetch more listings by clicking the button, and start from the last listing forward */}
          {/* if the last fetched listing exists then we want to show the button  */}
          {lastFetchedListing && (
            <div className="flex justify-center items-center">
              <button
                onClick={onFetchMoreListings}
                className="bg-blue-200 px-3 py-1.5 text-gray-700 border border-gray-300 mb-6 mt-6 rounded hover:border-slate-600 transition duration-150 ease-in-out shadow-md"
              >
                Load More
              </button>
            </div>
          )}
        </>
      ) : (
        //otherwise put a paragraph that say there aren't offers
        <p>There are no current offers</p>
      )}
    </div>
  );
}
