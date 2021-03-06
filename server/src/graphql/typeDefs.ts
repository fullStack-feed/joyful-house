import {gql} from "apollo-server-express";

export const typeDefs = gql`
    enum ListingsFilter {
        PRICE_LOW_TO_HIGH
        PRICE_HIGH_TO_LOW
    }
    # 用户信息
    type User {
        id: ID!
        name: String!
        avatar: String!
        contact: String!
        hasWallet: Boolean!
        income: Int
        bookings(limit: Int!, page: Int!): Bookings
        listings(limit: Int!, page: Int!): Listings!
    }
    # 用于分页的房子数据
    type Listings {
        region: String #用于Google查询地理位置后返回详细的地址
        total: Int!
        result: [Listing!]!
    }
    # 用于分页的订单数据
    type Bookings {
        total: Int!
        result: [Booking!]!
    }
    # 每一个订单信息
    type Booking {
        id: ID!
        listing: Listing!
        tenant: User!
        checkIn: String!
        checkOut: String!
    }
    # 每一个房子的信息
    type Listing {
        id: ID!
        title: String!
        description: String!
        image: String!
        host: User!
        type: ListingType!
        address: String!
        country: String!
        admin: String!
        city: String!
        bookings(limit: Int!, page: Int!): Bookings
        bookingsIndex: String!
        price: Int!
        numOfGuests: Int!
    }
    enum ListingType {
        APARTMENT
        HOUSE
    }
    # ----

    # ---- 登录的typeDefs

    # 用于登录resolvers的输入
    input LogInInput {
        code: String!
    }
    input CreateBookingInput {
        id: ID!
        source: String!
        checkIn: String!
        checkOut: String!
    }
    type Query {
        authUrl: String!
        user(id: ID!): User!
        listing(id:ID!):Listing!
        listings(location: String,filter: ListingsFilter!,limit:Int!,page:Int!):Listings!
    }
    # PUZZ: 这里Boolean! 是什么意思？为什么要有didRequest这个字段呢？
    # didRequest 字段标识该请求是否已经被处理
    type Viewer {
        id: ID
        token: String
        avatar: String
        hasWallet: Boolean
        didRequest: Boolean!
    }
    input ConnectStripeInput {
        code: String!
    }
    input HostListingInput {
        title: String!
        description: String!
        image: String!
        type: ListingType!
        address: String!
        price: Int!
        numOfGuests: Int!
    }
    type Mutation {
        logIn(input: LogInInput): Viewer!
        logOut: Viewer!
        connectStripe(input: ConnectStripeInput!): Viewer!
        disconnectStripe: Viewer!
        hostListing(input: HostListingInput!): Listing!
        createBooking(input: CreateBookingInput!): Booking!
    }
`;
