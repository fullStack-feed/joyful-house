import { gql } from "apollo-boost";

/**
 * 用于 查询用户登录的AuthUrl地址
 */
export const AUTH_URL = gql`
  query AuthUrl {
    authUrl
  }
`;
