import {gql} from "apollo-boost";

export const USER = gql`
    query User ($id:ID!,$bookingsPage: Int!,$listingsPage:Int!,$limit:Int!) {
        user(id: $id) {
            id
            name
            avatar
            contact
            hasWallet
            income
            bookings(limit: $limit,page:$bookingsPage) {
                total
                result {
                    id
                    listing{
                        id
                        title
                        image
                        address
                        price
                        numOfGuests
                    }
                }
            }
            listings(limit: $limit,page: $listingsPage) {
                total
                result{
                    id
                    title
                    image
                    address
                    price
                    numOfGuests
                }
            }
        }
    }
`
