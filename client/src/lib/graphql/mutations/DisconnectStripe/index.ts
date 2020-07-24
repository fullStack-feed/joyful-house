import { gql } from "apollo-boost";

export const DISCONNECT_STRIPE = gql`
    mutation DisconnectStripe {
        disconnectStripe {
            hasWallet
        }
    }
`;
