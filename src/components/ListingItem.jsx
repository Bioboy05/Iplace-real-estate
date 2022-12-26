import React from "react";
import Moment from "react-moment";
import { Link } from "react-router-dom";
import { MdLocationOn } from "react-icons/md";

//data we want to get is listing and id
export default function ListingItem({ listing, id }) {
  return (
    //want to return the listing name, props that would be passed in Profile.jsx
    <li className="relative bg-white flex flex-col justify-between items-center shadow-md hover:shadow-xl rounded-md overflow-hidden transition-shadow duration-105 m-[10px]">
      <Link className="contents" to={`/category/${listing.type}/${id}`}>
        {/* the src for this image will be imgUrls, but only the first image(album cover) */}
        <img
          className="h-[170px] w-full object-cover hover:scale-150 transition-scale duration-200 ease-in"
          loading="lazy" //meaning until we reach to that image, we don't want that image to be loaded, helping the page load faster
          src={listing.imgUrls[0]}
          alt=""
        />

        {/* using moment from react-moment to obtain the time passed since the listing */}
        <Moment
          className="absolute top-2 left-2 bg-amber-400 text-black uppercase text-xs font-semibold rounded-md px-2 py-1 shadow-lg"
          fromNow
        >
          {/* inside the Moment, we'll add the listing.timestamp, convert this to date, but we protect this in case if it's null */}
          {listing.timestamp?.toDate()}
        </Moment>
        {/* next, we'll create the address which will be shown in the listing card */}
        <div className="w-full p-[10px]">
          <div className="flex items-center gap-1">
            <MdLocationOn className="h-4 w-4 text-green-600" />
            <p className="font-semibold text-sm mb-[2px] text-gray-600 truncate uppercase">
              {listing.address}
            </p>
          </div>
          <p className="font-semibold m-0 text-xl truncate">{listing.name}</p>
          <p className=" text-amber-700 mt-2 font-semibold">
            $
            {listing.offer
              ? listing.discountedPrice
                  //in order the price to be separated with a comma we need a regex
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              : listing.regularPrice
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            {listing.type === "rent" && " / month"}
          </p>
          <div className="flex items-center mt-[10px] gap-3">
            <div className="flex items-center gap-1">
              {/* if it's more than one bed use the plural, otherwise the string */}
              <p className="font-bold text-xs">
                {listing.bedrooms > 1 ? `${listing.bedrooms} Beds` : "1 Bed"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <p className="font-bold text-xs">
                {listing.bathrooms > 1
                  ? `${listing.bathrooms} Baths`
                  : `1 Bath`}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
}
