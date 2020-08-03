import React from "react";
import {Button, Divider, Icon, Modal, Typography} from "antd";
import moment, {Moment} from "moment";
import {CardElement, injectStripe, ReactStripeElements} from "react-stripe-elements";
import {useMutation} from "@apollo/react-hooks";
import {CREATE_BOOKING} from "../../../../lib/graphql/mutations";
import {
  CreateBooking as CreateBookingData,
  CreateBookingVariables
} from "../../../../lib/graphql/mutations/CreateBooking/__generated__/CreateBooking";
import {
  formatListingPrice,
  displaySuccessNotification,
  displayErrorMessage
} from "../../../../lib/utils";

interface Props {
  // 订单详情
  id: string;
  price: number;
  checkInDate: Moment;
  checkOutDate: Moment;
  // 控制订单显示
  modalVisible: boolean;
  setModalVisible: (modalVisible: boolean) => void;
  // 成功后清除日期
  clearBookingData: () => void;
  // 刷新页面
  handleListingRefetch: () => Promise<void>;
}

const {Paragraph, Text, Title} = Typography;

export const ListingCreateBookingModal =
  ({
     id,
     price,
     modalVisible,
     checkInDate,
     checkOutDate,
     setModalVisible,
     clearBookingData,
     handleListingRefetch,
     stripe
   }: Props & ReactStripeElements.InjectedStripeProps) => {
    //  向服务器发出创建订单Mutation
    const [createBooking, { loading }] = useMutation<
      CreateBookingData,
      CreateBookingVariables
      >(CREATE_BOOKING, {
      /**
       * 成功后：
       * - 清除页面当前订阅的日期
       * - 弹出提示：订阅成功
       * - 刷新当前页面
       */
      onCompleted: () => {
        clearBookingData();
        displaySuccessNotification(
          "您已经成功订阅房间！",
          "订阅历史记录可以在您的个人信息中查阅！"
        );
        handleListingRefetch();
      },
      onError: () => {
        displayErrorMessage(
          "抱歉，现在不能为您创建订单，请稍后再试！"
        );
      }
    });
    // 计算日期差（需要补1）并计算金额
    const daysBooked = checkOutDate.diff(checkInDate, "days") + 1;
    const listingPrice = price * daysBooked;

    const handleCreateBooking = async () => {
      if (!stripe) {
        return displayErrorMessage("抱歉，您的stripe出现了一点问题！");
      }

      let {token: stripeToken, error} = await stripe.createToken();
      if (stripeToken) {
        await createBooking({
          variables: {
            input: {
              id,
              source: stripeToken.id,
              checkIn: moment(checkInDate).format("YYYY-MM-DD"),
              checkOut: moment(checkOutDate).format("YYYY-MM-DD")
            }
          }
        });
      } else {
        displayErrorMessage(
          error && error.message
            ? error.message
            : "Sorry! We weren't able to book the listing. Please try again later."
        );
      }
    };
    return (
      <Modal
        visible={modalVisible}
        centered
        footer={null}
        onCancel={() => setModalVisible(false)}
      >
        <div className="listing-booking-modal">
          <div className="listing-booking-modal__intro">
            <Title className="listing-boooking-modal__intro-title">
              <Icon type="key"></Icon>
            </Title>
            <Title level={3} className="listing-boooking-modal__intro-title">
              检查您的订单
            </Title>
            <Paragraph>
              检查您订阅的日期是否为{" "}
              <Text mark strong>
                {moment(checkInDate).format("MMMM Do YYYY")}
              </Text>{" "}
              至{" "}
              <Text mark strong>
                {moment(checkOutDate).format("MMMM Do YYYY")}
              </Text>              
            </Paragraph>
          </div>
          <Divider/>
          <div className="listing-booking-modal__charge-summary">
            <Paragraph>
              {formatListingPrice(price, false)} x {daysBooked} 天 ={" "}
              <Text strong>{formatListingPrice(listingPrice, false)}</Text>
            </Paragraph>
            <Paragraph className="listing-booking-modal__charge-summary-total">
              总价 = <Text mark>{formatListingPrice(listingPrice, false)}</Text>
            </Paragraph>
          </div>
          <Divider/>

          <div className="listing-booking-modal__stripe-card-section">
            <CardElement hidePostalCode className="listing-booking-modal__stripe-card"/>
            <Button
              size="large"
              type="primary"
              className="listing-booking-modal__cta"
              loading={loading}
              onClick={handleCreateBooking}
            >
              支付
            </Button>

          </div>
          <Text>
            测试卡号:4242 4242 4242 4242，合法的日期及CVC即可！
            </Text>

          <Text>
          注意：mock的数据中不存在真实的Stripe，只能订阅真实用户发布的House！（可以自己开两个账号测试或者搜索：苏鹏宇）
            </Text>
        </div>
      </Modal>
    );
  };
export const WrappedListingCreateBookingModal = injectStripe(ListingCreateBookingModal);
