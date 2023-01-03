import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ListingItem from "../components/ListingItem";
import Slider from "../components/Slider";
import { db } from "../firebase";

export default function Home() {
  //Offers
  const [offerListings, setOfferListings] = useState(null);
  //now we fill this offerListing using useEffect
  useEffect(() => {
    async function fetchListings() {
      //we use try and catch, in case we have an error
      try {
        //for the try we have to get the address reference
        //we create a const that uses collection method from firestore, that takes the db (from firebase file), and the collection we want to target is "listings"
        const listingsRef = collection(db, "listings");
        //create the query which is the condition or the limit of that request
        //q is using the query method from firestore
        //then we get the listingsRef, then we want to say where we get the information, so we use "where" from firestore, and the place we want to get is:
        //where the offer is equal to true(if the offer is true we're going to fetch them)
        //after that we use the orderBy method from firestore, and we're going to order it by timestamp, in a descending way(the one is created last is going to be the first in the list)
        const q = query(
          listingsRef,
          where("offer", "==", true),
          orderBy("timestamp", "desc"),
          limit(4) //limiting the listing only of the 4 listings in db
        );
        //we need to get the information using snapshot
        //execute the query
        //so we create a querySnap which is going to wait for getDocs from firestore
        const querySnap = await getDocs(q); //and we just put the query inside
        //this is going to get the information and save it inside a list, then set it inside offerListing from useState
        const listings = [];
        //use forEach to loop thorough the querySnap
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
          //now we have everything inside this listings
        });
        //we can just set the offer listings to listings
        setOfferListings(listings);
      } catch (error) {
        //avoid toasting the error here, because it would be annoying for the users/ we just log it in for us
        console.log(error);
      }
    }
    fetchListings();
  }, []);

  //Places for Rent
  const [rentListings, setRentListings] = useState(null);
  //now we fill this offerListing using useEffect
  useEffect(() => {
    async function fetchListings() {
      //we use try and catch, in case we have an error
      try {
        //for the try we have to get the address reference
        //we create a const that uses collection method from firestore, that takes the db (from firebase file), and the collection we want to target is "listings"
        const listingsRef = collection(db, "listings");
        //create the query which is the condition or the limit of that request
        //q is using the query method from firestore
        //then we get the listingsRef, then we want to say where we get the information, so we use "where" from firestore, and the place we want to get is:
        //where the offer is equal to true(if the offer is true we're going to fetch them)
        //after that we use the orderBy method from firestore, and we're going to order it by timestamp, in a descending way(the one is created last is going to be the first in the list)
        const q = query(
          listingsRef,
          where("type", "==", "rent"),
          orderBy("timestamp", "desc"),
          limit(4) //limiting the listing only of the 4 listings in db
        );
        //we need to get the information using snapshot
        //execute the query
        //so we create a querySnap which is going to wait for getDocs from firestore
        const querySnap = await getDocs(q); //and we just put the query inside
        //this is going to get the information and save it inside a list, then set it inside offerListing from useState
        const listings = [];
        //use forEach to loop thorough the querySnap
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
          //now we have everything inside this listings
        });
        //we can just set the offer listings to listings
        setRentListings(listings);
      } catch (error) {
        //avoid toasting the error here, because it would be annoying for the users/ we just log it in for us
        console.log(error);
      }
    }
    fetchListings();
  }, []);
  //Places for Sale
  const [saleListings, setSaleListings] = useState(null);
  //now we fill this saleListing using useEffect
  useEffect(() => {
    async function fetchListings() {
      //we use try and catch, in case we have an error
      try {
        //for the try we have to get the address reference
        //we create a const that uses collection method from firestore, that takes the db (from firebase file), and the collection we want to target is "listings"
        const listingsRef = collection(db, "listings");
        //create the query which is the condition or the limit of that request
        //q is using the query method from firestore
        //then we get the listingsRef, then we want to say where we get the information, so we use "where" from firestore, and the place we want to get is:
        //where the offer is equal to true(if the offer is true we're going to fetch them)
        //after that we use the orderBy method from firestore, and we're going to order it by timestamp, in a descending way(the one is created last is going to be the first in the list)
        const q = query(
          listingsRef,
          where("type", "==", "sale"),
          orderBy("timestamp", "desc"),
          limit(4) //limiting the listing only of the 4 listings in db
        );
        //we need to get the information using snapshot
        //execute the query
        //so we create a querySnap which is going to wait for getDocs from firestore
        const querySnap = await getDocs(q); //and we just put the query inside
        //this is going to get the information and save it inside a list, then set it inside offerListing from useState
        const listings = [];
        //use forEach to loop thorough the querySnap
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
          //now we have everything inside this listings
        });
        //we can just set the offer listings to listings
        setSaleListings(listings);
      } catch (error) {
        //avoid toasting the error here, because it would be annoying for the users/ we just log it in for us
        console.log(error);
      }
    }
    fetchListings();
  }, []);
  return (
    <div>
      <Slider />
      <div className="max-w-6xl mx-auto pt-4 space-y-6">
        {/* if offerListings exists and has at least one offer then we want to have a section */}
        {offerListings && offerListings.length > 0 && (
          //first we have a title Recent Offers, then a link to the offers page and finally the listings
          <div className="m-2 mb-6">
            <h2 className="px-3 text-2xl mt-6 font-semibold">Recent Offers</h2>
            {/* a ling to the offers page */}
            <Link to="/offers">
              <p className="px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out">
                Show more offers
              </p>
            </Link>
            {/* make the ul a grid for the responsiveness */}
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {/* we're going to loop through offerListings */}
              {offerListings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                />
              ))}
            </ul>
          </div>
        )}

        {/* if rentListings exists and has at least one offer then we want to have a section */}
        {rentListings && rentListings.length > 0 && (
          //first we have a title places for rent, then a link to the offers page and finally the listings
          <div className="m-2 mb-6">
            <h2 className="px-3 text-2xl mt-6 font-semibold">
              Places for rent
            </h2>
            {/* a link to the rent page */}
            <Link to="/category/rent">
              <p className="px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out">
                Show more places for rent
              </p>
            </Link>
            {/* make the ul a grid for the responsiveness */}
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {/* we're going to loop through offerListings */}
              {rentListings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                />
              ))}
            </ul>
          </div>
        )}
        {/* if saleListings exists and has at least one offer then we want to have a section */}
        {saleListings && saleListings.length > 0 && (
          //first we have a title Sale Offers, then a link to the offers page and finally the listings
          <div className="m-2 mb-6">
            <h2 className="px-3 text-2xl mt-6 font-semibold">
              Places for sale
            </h2>
            {/* a ling to the sales page */}
            <Link to="/category/sale">
              <p className="px-3 text-sm text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out">
                Show more places for sale
              </p>
            </Link>
            {/* make the ul a grid for the responsiveness */}
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {/* we're going to loop through offerListings */}
              {saleListings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
