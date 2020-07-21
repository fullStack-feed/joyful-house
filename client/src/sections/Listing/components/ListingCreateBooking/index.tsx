import React from "react";
import {Button, Card, Divider, Typography, DatePicker} from "antd";
import moment, {Moment} from "moment";
import {displayErrorMessage, formatListingPrice} from "../../../../lib/utils";

const {Paragraph, Title} = Typography;

interface Props {
  price: number
  checkInDate: Moment | null;
  checkOutDate: Moment | null;
  setCheckInDate: (checkInDate: Moment | null) => void;
  setCheckOutDate: (checkOutDate: Moment | null) => void;
}

export const ListingCreateBooking =
  ({
     price,
     checkInDate,
     checkOutDate,
     setCheckInDate,
     setCheckOutDate
   }: Props) => {
    const disabledDate = (currentDate?: Moment | null) => {
      if (currentDate) {
        const dateIsBeforeEndOfDay = currentDate.isBefore(moment().endOf("day"));

        return dateIsBeforeEndOfDay;
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
      }
      setCheckOutDate(selectedCheckOutDate);
    };
    const checkOutInputDisabled = !checkInDate;
    const buttonDisabled = !checkInDate || !checkOutDate;
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
            size="large" type="primary" className="listing-booking__card-cta">
            Request to book!
          </Button>
        </Card>
      </div>
    );
  }
