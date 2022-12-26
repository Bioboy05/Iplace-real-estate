import React from 'react'

//data we want to get is listing and id
export default function ListingItem({listing, id}) {
  return (
    //want to return the listing name, props that would be passed is Profile.jsx
    <div>{listing.name}</div>
  )
}
