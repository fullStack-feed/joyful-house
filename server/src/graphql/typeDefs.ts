import { gql } from "apollo-server-express";

export const typeDefs = gql`
  # 用于登录resolvers的输入
  input LogInInput {
    code: String!
  }
  # 用于查询登录的url
  type Query {
    authUrl: String!
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
`;
