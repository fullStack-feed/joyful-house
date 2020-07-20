import React from "react";
import {RouteComponentProps} from 'react-router-dom'
import {useQuery} from "@apollo/react-hooks";
import {UserProfile} from "./Components/UserProfile";
import {
  User as UserData,
  UserVariables
} from "../../lib/graphql/queries/User/__generated__/User";
import { USER } from "../../lib/graphql/queries";
import { Viewer } from "../../lib/types";
import { Col, Layout, Row } from "antd";
const { Content } = Layout;
interface MatchParams {
  id: string
}
interface Props {
  viewer: Viewer
}
export const User = ({viewer,match}: Props & RouteComponentProps<MatchParams>) => {
  const {data,loading,error} = useQuery<UserData,UserVariables>(USER,{
    variables: {
      id:match.params.id
    }
  })
  console.log(data)
  // 用户选项卡
  const user = data ? data.user : null
  // 判断当前访问的是否为用户自己，从而决定是否显示金额连接
  const viewerIsUser = viewer.id === match.params.id;
  const userProfileElement = user ? (
    <UserProfile user={user} viewerIsUser={viewerIsUser}/>
  ) : null
  return (
    <Content className="user">
      <Row gutter={12} >
        <Col xs={24}>{userProfileElement}</Col>
      </Row>
    </Content>
  );
};
