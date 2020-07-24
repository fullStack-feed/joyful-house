import React, {useState} from "react";
import {RouteComponentProps} from 'react-router-dom'
import {useQuery} from "@apollo/react-hooks";
import {UserProfile} from "./Components/UserProfile";
import {ErrorBanner, PageSkeleton} from "../../lib/components";
import {UserBookings} from './Components/UserBookings'
import {UserListings} from './Components/UserListings'
import {
  User as UserData,
  UserVariables
} from "../../lib/graphql/queries/User/__generated__/User";
import {USER} from "../../lib/graphql/queries";
import {Viewer} from "../../lib/types";
import {Col, Layout, Row} from "antd";

const {Content} = Layout;
const PAGE_LIMIT = 4;

interface MatchParams {
  id: string
}

interface Props {
  viewer: Viewer;
  setViewer: (viewer: Viewer) => void;
}

export const User =
  ({
     viewer,
     setViewer, match
   }: Props & RouteComponentProps<MatchParams>) => {
    // 用于分页的数据
    const [listingsPage, setListingsPage] = useState(1)
    const [bookingsPage, setBookingsPage] = useState(1)
    const {data, loading, error,refetch} = useQuery<UserData, UserVariables>(USER, {
      variables: {
        id: match.params.id,
        listingsPage,
        bookingsPage,
        limit: PAGE_LIMIT
      }
    })
    const handleUserRefetch = async () => {
      await refetch();
    };
    const stripeError = new URL(window.location.href).searchParams.get("stripe_error");
    const stripeErrorBanner = stripeError ? (
      <ErrorBanner description="We had an issue connecting with Stripe. Please try again soon."/>
    ) : null;
    if (loading) {
      return (
        <Content className="user">
          <PageSkeleton/>
        </Content>
      );
    }

    if (error) {
      return (
        <Content className="user">
          <ErrorBanner description="This user may not exist or we've encountered an error. Please try again soon."/>
          <PageSkeleton/>
        </Content>
      );
    }
    // 用户选项卡
    const user = data ? data.user : null
    // 判断当前访问的是否为用户自己，从而决定是否显示金额连接
    const viewerIsUser = viewer.id === match.params.id;
    const userListings = user ? user.listings : null;
    const userBookings = user ? user.bookings : null;
    const userProfileElement = user ? (
      <UserProfile
        user={user}
        viewer={viewer}
        viewerIsUser={viewerIsUser}
        setViewer={setViewer}
        handleUserRefetch={handleUserRefetch}
      />
    ) : null
    const userListingsElement = userListings ? (
      <UserListings
        userListings={userListings}
        listingsPage={listingsPage}
        limit={PAGE_LIMIT}
        setListingsPage={setListingsPage}
      />
    ) : null;

    const userBookingsElement = userBookings ? (
      <UserBookings
        userBookings={userBookings}
        bookingsPage={bookingsPage}
        limit={PAGE_LIMIT}
        setBookingsPage={setBookingsPage}
      />
    ) : null;

    return (
      <Content className="user">
        {stripeErrorBanner}
        <Row gutter={12} type="flex" justify="space-between">
          <Col xs={24}>{userProfileElement}</Col>
          <Col xs={24}>
            {userListingsElement}
            {userBookingsElement}
          </Col>
        </Row>
      </Content>
    );
  };
