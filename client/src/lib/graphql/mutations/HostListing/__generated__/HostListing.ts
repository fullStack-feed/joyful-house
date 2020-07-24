/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { HostListingInput } from "./../../../globalTypes";

// ====================================================
// GraphQL mutation operation: HostListing
// ====================================================

export interface HostListing_hostListing {
  __typename: "Listing";
  id: string;
}

export interface HostListing {
  hostListing: HostListing_hostListing;
}

export interface HostListingVariables {
  input: HostListingInput;
}
