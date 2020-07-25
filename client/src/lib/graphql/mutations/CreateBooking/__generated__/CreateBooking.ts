/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CreateBookingInput } from "./../../../globalTypes";

// ====================================================
// GraphQL mutation operation: CreateBooking
// ====================================================

export interface CreateBooking_createBooking {
  __typename: "Booking";
  id: string;
}

export interface CreateBooking {
  createBooking: CreateBooking_createBooking;
}

export interface CreateBookingVariables {
  input: CreateBookingInput;
}
