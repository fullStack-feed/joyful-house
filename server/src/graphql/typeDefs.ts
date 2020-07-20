import { gql } from "apollo-server-express";

export const typeDefs = gql`
  # ---- 用户信息的typeDefs
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
  # 用于房子信息分页
  type Listings {
      total: Int!
      result: [Listing!]!
  }
  # 用于订单信息分页
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
  # 每个房子的信息
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
  }
  # PUZZ: 这里Boolean! 是什么意思？为什么要有didRequest这个字段呢？
  type Viewer {
    id: ID
    token: String
    avatar: String
    hasWallet: Boolean
    didRequest: Boolean!
  }
  # 登录登出功能返回值都是一个用户实体
  type Mutation {
    logIn(input: LogInInput): Viewer!
    logOut: Viewer!
  }
  # ----
`;
