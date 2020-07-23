import {gql} from "apollo-boost";

export const LISTINGS = gql`
    query Listings($location: String,$filter: ListingsFilter!, $limit: Int!, $page: Int!) {
        listings(location: $location,filter: $filter, limit: $limit, page: $page) {
            total
            result {
                id
                title
                image
                address
                price
                numOfGuests
            }
        }
    }
`;
