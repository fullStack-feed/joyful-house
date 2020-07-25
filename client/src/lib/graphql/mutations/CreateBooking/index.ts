import { gql } from "apollo-boost";

export const CREATE_BOOKING = gql`
    mutation CreateBooking($input: CreateBookingInput!) {
        createBooking(input: $input) {
            id
        }
    }
`;
