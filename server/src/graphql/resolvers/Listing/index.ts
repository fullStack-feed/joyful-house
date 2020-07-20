import {IResolvers} from "apollo-server-express";
import {Listing} from "../../../lib/types";

export const listingResolvers: IResolvers = {
  Listing: {
    id: (listing: Listing): string => {
      return listing._id.toString();
    }
  }
}
