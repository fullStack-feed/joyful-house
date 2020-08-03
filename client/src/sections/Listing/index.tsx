import React, {useState} from "react";
import {RouteComponentProps} from 'react-router-dom'
import {
  ListingBookings,
  ListingDetails,
  ListingCreateBooking,
  WrappedListingCreateBookingModal as ListingCreateBookingModal,
} from "./components";
import {Col, Layout, Row} from "antd";
import {useQuery} from "@apollo/react-hooks";
import {LISTING} from "../../lib/graphql/queries";
import {
  Listing as ListingData,
  ListingVariables
} from "../../lib/graphql/queries/Listing/__generated__/Listing";
import {ErrorBanner, PageSkeleton} from "../../lib/components";
import {Moment} from "moment";
import {Viewer} from "../../lib/types";

const {Content} = Layout;

interface MatchParams {
  id: string
}

const PAGE_LIMIT = 3;

/**
 * 
 */
interface Props {
  viewer: Viewer
}
/**
 * todo：
 * 
 * - 拉取数据进行展示内容
 * 
 * - 日期选择校验
 * 
 */
export const Listing = ({match, viewer}: Props & RouteComponentProps<MatchParams>) => {
  const [checkInDate, setCheckInDate] = useState<Moment | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Moment | null>(null);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
//  发起GraphQL查询当前房间信息
  const {data, error, loading,refetch} = useQuery<ListingData, ListingVariables>(LISTING, {
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
  const listing = data ? data.listing : null;
  const listingBookings = listing ? listing.bookings : null;
  const clearBookingData = () => {
    setModalVisible(false);
    setCheckInDate(null);
    setCheckOutDate(null);
  };
  // 刷新当前页面
  const handleListingRefetch = async () => {
    await refetch();
  };

  const listingDetailsElement = listing ? <ListingDetails listing={listing}/> : null;
  const listingBookingsElement = listingBookings ? <ListingBookings
    listingBookings={listingBookings}
    bookingsPage={bookingsPage}
    limit={PAGE_LIMIT}
    setBookingsPage={setBookingsPage}
  /> : null;
  const listingCreateBookingElement = listing ? (<ListingCreateBooking
    viewer={viewer}
    host={listing.host}
    price={listing.price}
    bookingsIndex={listing.bookingsIndex}
    checkInDate={checkInDate}
    checkOutDate={checkOutDate}
    setCheckInDate={setCheckInDate}
    setCheckOutDate={setCheckOutDate}
    setModalVisible={setModalVisible}
  />) : null;
  const listingCreateBookingModalElement =
    listing && checkInDate && checkOutDate ? (
      <ListingCreateBookingModal
        id={listing.id}
        price={listing.price}
        modalVisible={modalVisible}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        setModalVisible={setModalVisible}
        clearBookingData={clearBookingData}
        handleListingRefetch={handleListingRefetch}
      />
    ) : null;

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
      {listingCreateBookingModalElement}
    </Content>
  );
};
