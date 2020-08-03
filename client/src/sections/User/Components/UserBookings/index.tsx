import React from 'react'
import {User} from "../../../../lib/graphql/queries/User/__generated__/User";
import { List, Typography } from "antd";
import { ListingCard } from "../../../../lib/components";
interface Props {
  userBookings: User['user']['bookings']
  bookingsPage: number,
  limit: number
  setBookingsPage: (page: number) => void
}

const { Paragraph, Text, Title } = Typography;

export const UserBookings = ({
  userBookings,
  bookingsPage,
  limit,
  setBookingsPage
}: Props) => {
  const total = userBookings ? userBookings.total : null;
  const result = userBookings ? userBookings.result : null;
  const userBookingsList = userBookings ? (
    <List
      grid={{
        gutter: 8,
        xs: 1,
        sm: 2,
        lg: 4
      }}
      dataSource={result ? result : undefined}
      locale={{ emptyText: "You haven't made any bookings!" }}
      pagination={{
        position: "top",
        current: bookingsPage,
        total: total ? total : undefined,
        defaultPageSize: limit,
        hideOnSinglePage: true,
        showLessItems: true,
        onChange: (page: number) => setBookingsPage(page)
      }}
      renderItem={userBooking => {
        const bookingHistory = (
          <div className="user-bookings__booking-history">
            <div>
              {/*Check in: <Text strong>{userBooking.checkIn}</Text>*/}
            </div>
            <div>
              {/*Check out: <Text strong>{userBooking.checkOut}</Text>*/}
            </div>
          </div>
        );

        return (
          <List.Item>
            {bookingHistory}
            <ListingCard listing={userBooking.listing} />
          </List.Item>
        );
      }}
    />
  ) : null;
  const userBookingsElement = userBookingsList ? (
    <div className="user-bookings">
      <Title level={4} className="user-bookings__title">
        订阅历史
      </Title>
      <Paragraph className="user-bookings__description">
      您可以查阅已完成的预订，以及与所述预订相关的入住/退房日期
      </Paragraph>
      {userBookingsList}
    </div>
  ) : null;
  return userBookingsElement;
}
