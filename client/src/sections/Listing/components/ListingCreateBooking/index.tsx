import React from "react";
import {Button, Card, Divider, Typography, DatePicker} from "antd";
import moment, {Moment} from "moment";
import {displayErrorMessage, formatListingPrice} from "../../../../lib/utils";
import {Viewer} from "../../../../lib/types";
import { Listing as ListingData } from "../../../../lib/graphql/queries/Listing/__generated__/Listing";
import {BookingsIndex} from "../../types";

const {Paragraph, Title, Text} = Typography;

interface Props {
  bookingsIndex:ListingData["listing"]["bookingsIndex"],
  host:ListingData["listing"]["host"],
  viewer: Viewer;
  price: number;
  checkInDate: Moment | null;
  checkOutDate: Moment | null;
  setCheckInDate: (checkInDate: Moment | null) => void;
  setCheckOutDate: (checkOutDate: Moment | null) => void;
  setModalVisible: (modalVisible: boolean) => void;
}


export const ListingCreateBooking =
  ({
     bookingsIndex,
     host,
     viewer,
     price,
     checkInDate,
     checkOutDate,
     setCheckInDate,
     setCheckOutDate,
     setModalVisible
   }: Props) => {
    const disabledDate = (currentDate?: Moment | null) => {
      if (currentDate) {
        const dateIsBeforeEndOfDay = currentDate.isBefore(moment().endOf("day"));

        return dateIsBeforeEndOfDay;
      } else {
        return false;
      }
    };
    const dateIsBooked = (currentDate: Moment) => {
      const year = moment(currentDate).year();
      const month = moment(currentDate).month();
      const day = moment(currentDate).date();

      if (bookingsIndexJSON[year] && bookingsIndexJSON[year][month]) {
        return Boolean(bookingsIndexJSON[year][month][day]);
      } else {
        return false;
      }
    };
    const verifyAndSetCheckOutDate = (selectedCheckOutDate: Moment | null) => {
      if (checkInDate && selectedCheckOutDate) {
        if (moment(selectedCheckOutDate).isBefore(checkInDate, "days")) {
          return displayErrorMessage(
            `You can't book date of check out to be prior to check in!`
          );
        }
        let dateCursor = checkInDate;
        while (moment(dateCursor).isBefore(selectedCheckOutDate, "days")) {
          dateCursor = moment(dateCursor).add(1, "days");
          const year = moment(dateCursor).year();
          const month = moment(dateCursor).month();
          const day = moment(dateCursor).date();
          if (
            bookingsIndexJSON[year] &&
            bookingsIndexJSON[year][month] &&
            bookingsIndexJSON[year][month][day]
          ) {
            return displayErrorMessage(
              "You can't book a period of time that overlaps existing bookings. Please try again!"
            );
          }
        }
      }
      setCheckOutDate(selectedCheckOutDate);
    };
    const checkOutInputDisabled = !checkInDate;
    const checkInInputDisabled = !viewer.id;
    const buttonDisabled = !checkInDate || !checkOutDate;
    const viewerIsHost = viewer.id === host.id;
    let buttonMessage = "抱歉，请选择正确日期";
    if (!viewer.id) {
      buttonMessage = "你必须登录才能预定房间";
    } else if(viewerIsHost) {
      buttonMessage = "不能自己预定自己的房间";
    }else if (!host.hasWallet) {
      buttonMessage =
        "抱歉，当前房东在Stripe已经下线 ... 稍后再来吧 ~ ";
    }
    const bookingsIndexJSON: BookingsIndex = JSON.parse(bookingsIndex);

    return (
      <div className="listing-booking">
        <Card className="listing-booking__card">
          <div>
            <Paragraph>
              <Title level={2} className="listing-booking__card-title">
                {formatListingPrice(price)}
                <span>/day</span>
              </Title>
            </Paragraph>
            <Paragraph>
              <Title level={2} className="listing-booking__card-title">
                Here will be the price!
              </Title>
            </Paragraph>
            <Divider/>
            <div className="listing-booking__card-date-picker">
              <Paragraph strong>Check In</Paragraph>
              <DatePicker
                value={checkInDate ? checkInDate : undefined}
                onChange={dataValue => setCheckInDate(dataValue)}
                format={"YYYY/MM/DD"}
                disabledDate={disabledDate}
                disabled={checkInInputDisabled}
                showToday={false}
                onOpenChange={() => setCheckOutDate(null)}
              />
            </div>
            <div className="listing-booking__card-date-picker">
              <Paragraph strong>Check Out</Paragraph>
              <DatePicker
                value={checkOutDate ? checkOutDate : undefined}
                onChange={dataValue => verifyAndSetCheckOutDate(dataValue)}
                format={"YYYY/MM/DD"}
                disabledDate={disabledDate}
                showToday={false}
                disabled={checkOutInputDisabled}
              />
            </div>
          </div>
          <Divider/>
          <Button
            disabled={buttonDisabled}
            size="large"
            type="primary"
            className="listing-booking__card-cta"
            onClick={() => setModalVisible(true)}
          >
            Request to book!
          </Button>
          <Text type="secondary" mark>
            {buttonMessage}
          </Text>
        </Card>
      </div>
    );
  }
