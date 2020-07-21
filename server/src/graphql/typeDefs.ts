import {gql} from "apollo-server-express";

export const typeDefs = gql`
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
    # 用于查询登录的url
    type Query {
        authUrl: String!
        user(id: ID!): User!
        listing(id:ID!):Listing!
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
    # 登录登出功能返回值都是一个用户实体
    # 如果一个操作是有"副作用的" 例如登录需要将信息写入数据库，那么铁定是一个Mutation，或者
    # 可以理解为mutation 不是幂等的请求    
    type Mutation {
        logIn(input: LogInInput): Viewer!
        logOut: Viewer!
    }
    # ----
`;
