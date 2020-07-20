import {Booking, Listing} from "../../../lib/types";

export interface UserArgs {
  id: string;
}
export interface UserBookingArgs {
  limit: number;
  page: number;
}
export interface UserBookingsData {
  total: number;
  result: Booking[];
}
export interface UserListingsArgs {
  limit: number;
  page: number;
}

export interface UserListingsData {
  total: number;
  result: Listing[];
}
