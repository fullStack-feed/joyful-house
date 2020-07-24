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
  const [disconnectStripe, {loading}] = useMutation<DisconnectStripeData>(
    DISCONNECT_STRIPE,
    {
      onCompleted: data => {
        if (data && data.disconnectStripe) {
          displaySuccessNotification(
            "You've successfully disconnected from Stripe!",
            "You'll have to reconnect with Stripe to continue to create listings."
          );
          handleUserRefetch();
        }
      }, onError: () => {
        displayErrorMessage(
          "Sorry! We weren't able to disconnect you from Stripe. Please try again later!"
        );
      }
    }
  );
  const redirectToStripe = () => {
    window.location.href = stripeAuthUrl;
  };
  const additionalDetails = user.hasWallet ? (
    <Fragment>
      <Paragraph>
        <Tag color="green">Stripe Registered</Tag>
      </Paragraph>
      <Paragraph>
        Income Earned:{" "}
        <Text strong>{user.income ? formatListingPrice(user.income) : `$0`}</Text>
      </Paragraph>
      <Button  type="primary" className="user-profile__details-cta"
               loading={loading}
               onClick={() => disconnectStripe()}
      >
        关闭你的 Stripe
      </Button>
      <Paragraph type="secondary">
        By disconnecting, you won't be able to receive{" "}
        <Text strong>any further payments</Text>. This will prevent users from booking
        listings that you might have already created.
      </Paragraph>
    </Fragment>
  ) : (
    <Fragment>
      <Paragraph>
        Interested in becoming a TinyHouse host? Register with your Stripe account!
      </Paragraph>
      <Button
        type="primary"
        className="user-profile__details-cta"
        onClick={redirectToStripe}
      >
        登录你的 Stripe
      </Button>
      <Paragraph type="secondary">
        TinyHouse uses{" "}
        <a
          href="https://stripe.com/en-US/connect"
          target="_blank"
          rel="noopener noreferrer"
        >
          Stripe
        </a>{" "}
        to help transfer your earnings in a secure and truster manner.
      </Paragraph>
    </Fragment>
  );
  const additionalDetailsSection = viewerIsUser ? (
    <Fragment>
      <Divider />
      <div className="user-profile__details">
        <Title level={4}>Additional Details</Title>
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
          <Title level={4}>Details</Title>
          <Paragraph>
            Name: <Text strong>{user.name}</Text>
          </Paragraph>
          <Paragraph>
            Contact: <Text strong>{user.contact}</Text>
          </Paragraph>
        </div>
        {additionalDetailsSection}
      </Card>
    </div>
  )
}
