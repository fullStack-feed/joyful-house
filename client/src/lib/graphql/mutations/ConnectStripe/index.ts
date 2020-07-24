import {gql} from 'apollo-boost'

export const CONNECT_STRIPE = gql`
    mutation ConnectStripe($input:ConnectStripeInput!) {
        connectStripe(input: $input) {
            hasWallet
        }
    }
`
