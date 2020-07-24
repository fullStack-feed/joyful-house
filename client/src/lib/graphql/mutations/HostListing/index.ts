import { gql } from "apollo-boost";

export const HOST_LISTING = gql`
    mutation HostListing($input: HostListingInput!) {
        hostListing(input: $input) {
            id
        }
    }
`;
