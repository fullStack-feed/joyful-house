import React from "react";
import {Button, Card, Divider, Typography, DatePicker} from "antd";
import moment, {Moment} from "moment";
import {displayErrorMessage, formatListingPrice} from "../../../../lib/utils";
import {Viewer} from "../../../../lib/types";
import { Listing as ListingData } from "../../../../lib/graphql/queries/Listing/__generated__/Listing";
import {BookingsIndex} from "../../types";

const {Paragraph, Title, Text} = Typography;

interface Props {
  // 房产信息
  bookingsIndex:ListingData["listing"]["bookingsIndex"],
  host:ListingData["listing"]["host"],
  viewer: Viewer; 
  price: number;
  // 日期控制
  checkInDate: Moment | null;
  checkOutDate: Moment | null;
  setCheckInDate: (checkInDate: Moment | null) => void;
  setCheckOutDate: (checkOutDate: Moment | null) => void;
  // 控制交付界面
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
    //  将订阅的日期转化成JSON对象，便于判断是否已经订阅
    const bookingsIndexJSON: BookingsIndex = JSON.parse(bookingsIndex);
    /**
     * - 检查当前日期是否可用，会和“今天”比较
     *    * 如果早于今天，则表示不可使用，返回false
     * 
     * - 检查当前日期是否超过未来“三个月”
     *    * 不能订阅三个月后的房子
     * 
     * - 检查当前日期是否被订阅
     *    * 不能重复订阅一间房
     * 
     * @param currentDate 选择的某一天
     */
    const disabledDate = (currentDate?: Moment | null) => {
      if (currentDate) {
        const dateIsBeforeEndOfDay = currentDate.isBefore(moment().endOf("day"));
        const dateIsMoreThenThreeMouthsAhead = moment(currentDate).isAfter(
          moment()
          .endOf('day')
          .add(90,"days")
        )
        return (
          dateIsBeforeEndOfDay ||
          dateIsMoreThenThreeMouthsAhead ||
          dateIsBooked(currentDate)
        )
      } else {
        return false;
      }
    };
    /**
     * - 检查当前日期是否被订阅过
     * - 将currentDate，日期化 => 年 月 日
     * - 从bookingsIndex读出日期化的值（预定 === true)
     * @param currentDate 选择的某一天
     */
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
    /**
     * - 首先检查是否有退房日期和入住日期的顺序（不能早入入住）
     * 
     * - 检查从入住日期到退房日期中间是否存在“已被订阅的房间”
     * 
     * @param selectedCheckOutDate 需要检查的结束日期
     */
    const verifyAndSetCheckOutDate = (selectedCheckOutDate: Moment | null) => {
      if (checkInDate && selectedCheckOutDate) {
        if (moment(selectedCheckOutDate).isBefore(checkInDate, "days")) {
          return displayErrorMessage(
            `抱歉！您不能订阅比入住还早的日期呀！`
          );
        }
        /**
         * 以入住时间为移动指针
         * 
         * 在入住日期 - 退房日期之间，检查是否被订阅
         * 
         * 方式：让dateCursor 以每天的刻度向前gorw
         *      如果检查到某一天被预定，直接return掉
         *      如果没有被预定，则 什么都不做
         */
        let dateCursor = checkInDate;
        while (moment(dateCursor).isBefore(selectedCheckOutDate, "days")) {
          // 向前grow
          dateCursor = moment(dateCursor).add(1, "days");
          // 实例化日期，进行match
          const year = moment(dateCursor).year();
          const month = moment(dateCursor).month();
          const day = moment(dateCursor).date();
          if (
            bookingsIndexJSON[year] &&
            bookingsIndexJSON[year][month] &&
            bookingsIndexJSON[year][month][day]
          ) {
            return displayErrorMessage(
              "抱歉！您订阅的房间已经提前被人预定啦！"
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
    let buttonMessage = "测试而已，没有任何费用，大胆支付！";
    if (!viewer.id) {
      buttonMessage = "你必须登录才能预定房间！";
    } else if(viewerIsHost) {
      buttonMessage = "不能自己预定自己的房间！";
    }else if (!host.hasWallet) {
      buttonMessage =
        "抱歉，当前房东在Stripe已经下线 ... 稍后再来吧 ！ ";
    }  
    return (
      <div className="listing-booking">
        <Card className="listing-booking__card">
          <div>
            <Paragraph>
              <Title level={2} className="listing-booking__card-title">
                {formatListingPrice(price)}
                <span>/天</span>
              </Title>
            </Paragraph>
            <Paragraph>
              
            </Paragraph>
            <Divider/>
            <div className="listing-booking__card-date-picker">
              <Paragraph strong>入住日期</Paragraph>
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
              <Paragraph strong>退房日期</Paragraph>
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
            预定房间
          </Button>
          <Text type="secondary" mark>
            {buttonMessage}
          </Text>
        </Card>
      </div>
    );
  }
