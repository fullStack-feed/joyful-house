import React, {Fragment} from 'react'
import {useMutation} from "@apollo/react-hooks";
import {DISCONNECT_STRIPE} from "../../../../lib/graphql/mutations/";
import {DisconnectStripe as DisconnectStripeData} from "../../../../lib/graphql/mutations/DisconnectStripe/__generated__/DisconnectStripe";
import {User as UserData} from "../../../../lib/graphql/queries/User/__generated__/User";
import {Avatar, Button, Card, Divider, Tag, Typography} from "antd";
import {
  formatListingPrice,
  displaySuccessNotification,
  displayErrorMessage
} from "../../../../lib/utils";
import {Viewer} from "../../../../lib/types";

const {Paragraph, Text, Title} = Typography;

interface Props {
  user: UserData["user"];
  viewer: Viewer;
  viewerIsUser: boolean;
  setViewer: (viewer: Viewer) => void;
  handleUserRefetch: () => void
}

const stripeAuthUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.REACT_APP_S_CLIENT_ID}&scope=read_write`;

export const UserProfile = ({user, viewer, viewerIsUser, setViewer,handleUserRefetch}: Props) => {
  
  // 发起断开Stripe的Mutation
  const [disconnectStripe, {loading}] = useMutation<DisconnectStripeData>(
    DISCONNECT_STRIPE,
    {
      onCompleted: data => {
        if (data && data.disconnectStripe) {
          displaySuccessNotification(
            "成功断开Stripe连接！",
            "您必须重新登录Stripe后才能发布出租信息！"
          );
          handleUserRefetch();
        }
      }, onError: () => {
        displayErrorMessage(
          "抱歉！断开Stripe失败！"
        );
      }
    }
  );
  // 修改当前url，重定向到登录stripe的url中
  const redirectToStripe = () => {
    window.location.href = stripeAuthUrl;
  };
  const additionalDetails = user.hasWallet ? (
    <Fragment>
      <Paragraph>
        <Tag color="green">Stripe 已登录</Tag>
      </Paragraph>
      <Paragraph>
        收入：{" "}
        <Text strong>{user.income ? formatListingPrice(user.income) : `$0`}</Text>
      </Paragraph>
      <Button  type="primary" className="user-profile__details-cta"
               loading={loading}
               onClick={() => disconnectStripe()}
      >
        关闭你的 Stripe
      </Button>
      <Paragraph type="secondary">
        断开连接后您将不会再{" "}
        <Text strong>收到任何房间订阅</Text>这样可以防止用户预订您可能已经创建的列表
      </Paragraph>
    </Fragment>
  ) : (
    <Fragment>
      <Paragraph>
      有兴趣成为joyful-house房东吗？用您的Stripe帐户登录既可！
      </Paragraph>
      <Button
        type="primary"
        className="user-profile__details-cta"
        onClick={redirectToStripe}
      >
        登录你的 Stripe
      </Button>
      <Paragraph type="secondary">
      joyful-house 使用{" "}
        <a
          href="https://stripe.com/en-US/connect"
          target="_blank"
          rel="noopener noreferrer"
        >
          Stripe
        </a>{" "}
        以安全可靠的方式帮助您进行金额交易！
      </Paragraph>
    </Fragment>
  );
  const additionalDetailsSection = viewerIsUser ? (
    <Fragment>
      <Divider />
      <div className="user-profile__details">
        <Title level={4}>额外细节</Title>
        {additionalDetails}
      </div>
    </Fragment>
  ) : null;
  return (
    <div className="user-profile">
      <Card className="user-profile__card">
        <div className="user-profile__avatar">
          <Avatar size={100} src={user.avatar}/>
        </div>
        <Divider/>
        <div className="user-profile__details">
          <Title level={4}>主要信息</Title>
          <Paragraph>
            用户名称: <Text strong>{user.name}</Text>
          </Paragraph>
          <Paragraph>
            联系方式: <Text strong>{user.contact}</Text>
          </Paragraph>
        </div>
        {additionalDetailsSection}
      </Card>
    </div>
  )
}
