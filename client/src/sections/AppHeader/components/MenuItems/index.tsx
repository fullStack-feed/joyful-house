import React from "react";
import { Link } from "react-router-dom";
import { Viewer } from "../../../../lib/types";
import { useMutation } from "@apollo/react-hooks";
import { LOG_OUT } from "../../../../lib/graphql/mutations";
import { LogOut as LogOutData } from "../../../../lib/graphql/mutations/LogOut/__generated__/LogOut";
import {
  displaySuccessNotification,
  displayErrorMessage,
} from "../../../../lib/utils";
import { Menu, Avatar, Button } from "antd";
import { UserOutlined, LoginOutlined, HomeOutlined } from "@ant-design/icons";
const { Item, SubMenu } = Menu;
interface Props {
  viewer: Viewer;
  setViewer: (viewer: Viewer) => void;
}

export const MenuItems = ({ viewer, setViewer }: Props) => {
  // 实现登出功能
  // 明白了 useMutation 只是将这个GraphQL的resolver函数进行包装
  const [logOut] = useMutation<LogOutData>(LOG_OUT, {
    onCompleted: (data) => {
      console.log(`登出mutation成功，获取的数据为`);
      console.log(data);
      if (data && data.logOut) {
        setViewer(data.logOut);
        sessionStorage.removeItem('token')
      }
      displaySuccessNotification("你已经成功登出");
    },
    onError: () => {
      console.log(`登出mutations失败`);
      displayErrorMessage(`登出账号失败，原因不明`);
    },
  });
  const handleLogOut = () => {
    logOut();
  };

  // PUZZ: 为什么Item组件 需要使用key值呢？
  const subMenuLogin =
    viewer.id && viewer.avatar ? (
      <SubMenu title={<Avatar src={viewer.avatar} />}>
        <Item key="/user">
          <Link to={`/user/${viewer.id}`}>
            <UserOutlined />
            Profile
          </Link>
        </Item>
        <Item key="/logout">
          <div onClick={handleLogOut}>
            <LoginOutlined />
            Log out
          </div>
        </Item>
      </SubMenu>
    ) : (
      <Link to="/login">
        <Button type="primary">Sign In</Button>
      </Link>
    );

  return (
    <Menu mode="horizontal" selectable={false} className="menu">
      <Item key="/host">
        <Link to="/host">
          <HomeOutlined />
          Host
        </Link>
      </Item>
      {subMenuLogin}
    </Menu>
  );
};
