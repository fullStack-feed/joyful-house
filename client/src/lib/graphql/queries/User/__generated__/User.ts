/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: User
// ====================================================

export interface User_user_bookings_result_listing {
  __typename: "Listing";
  id: string;
  title: string;
  image: string;
  address: string;
  price: number;
  numOfGuests: number;
}

export interface User_user_bookings_result {
  __typename: "Booking";
  id: string;
  listing: User_user_bookings_result_listing;
}

export interface User_user_bookings {
  __typename: "Bookings";
  total: number;
  result: User_user_bookings_result[];
}

export interface User_user_listings_result {
  __typename: "Listing";
  id: string;
  title: string;
  image: string;
  address: string;
  price: number;
  numOfGuests: number;
}

export interface User_user_listings {
  __typename: "Listings";
  total: number;
  result: User_user_listings_result[];
}

export interface User_user {
  __typename: "User";
  id: string;
  name: string;
  avatar: string;
  contact: string;
  hasWallet: boolean;
  income: number | null;
  bookings: User_user_bookings | null;
  listings: User_user_listings;
}

export interface User {
  user: User_user;
}

export interface UserVariables {
  id: string;
  bookingsPage: number;
  listingsPage: number;
  limit: number;
}
