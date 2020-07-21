import React, {useState} from "react";
import {RouteComponentProps} from 'react-router-dom'
import {ListingBookings, ListingDetails, ListingCreateBooking} from "./components";
import {Col, Layout, Row} from "antd";
import {useQuery} from "@apollo/react-hooks";
import {LISTING} from "../../lib/graphql/queries";
import {
  Listing as ListingData,
  ListingVariables
} from "../../lib/graphql/queries/Listing/__generated__/Listing";
import {ErrorBanner, PageSkeleton} from "../../lib/components";
import { Moment } from "moment";

const {Content} = Layout;

interface MatchParams {
  id: string
}


const PAGE_LIMIT = 3;

export const Listing = ({match}: RouteComponentProps<MatchParams>) => {
  const [checkInDate, setCheckInDate] = useState<Moment | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Moment | null>(null);
  const [bookingsPage, setBookingsPage] = useState(1);
//  发起GraphQL查询
  const {data, error, loading} = useQuery<ListingData, ListingVariables>(LISTING, {
    variables: {
      id: match.params.id,
      bookingsPage,
      limit: PAGE_LIMIT
    }
  });
  if (loading) {
    return (
      <Content className="listings">
        <PageSkeleton/>
      </Content>
    );
  }
  if (error) {
    return (
      <Content className="listing">
        <ErrorBanner description="This listing may not exist or we've encountered an error. Please try again soon."/>
        <PageSkeleton/>
      </Content>
    );
  }
  // 判断是否存在数据，以便确定 ListingDetails 和 ListingBookings 组件的渲染；
  const listing = data ? data.listing : null;
  const listingBookings = listing ? listing.bookings : null;
  const listingDetailsElement = listing ? <ListingDetails listing={listing}/> : null;
  const listingBookingsElement = listingBookings ? <ListingBookings
    listingBookings={listingBookings}
    bookingsPage={bookingsPage}
    limit={PAGE_LIMIT}
    setBookingsPage={setBookingsPage}
  /> : null;
  const listingCreateBookingElement = listing ? (<ListingCreateBooking
    price={listing.price}
    checkInDate={checkInDate}
    checkOutDate={checkOutDate}
    setCheckInDate={setCheckInDate}
    setCheckOutDate={setCheckOutDate}
  />) : null;


  return (
    <Content className="listings">
      <Row gutter={24} type="flex" justify="space-between">
        <Col xs={24} lg={14}>
          {listingDetailsElement}
          {listingBookingsElement}
        </Col>
        <Col xs={24} lg={10}>
          {listingCreateBookingElement}
        </Col>
      </Row>
    </Content>
  );
};
