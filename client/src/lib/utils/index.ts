import { message, notification } from "antd";

/**
 *
 * @param price 需要转换的金额
 * @param round 是否需要整数显示
 */
export const formatListingPrice = (price: number,round = true) => {
  const formattedListingPrice = round ? Math.floor(price / 100) : price / 100;
  return `$${formattedListingPrice}`;
}
export const iconColor = "#1890ff";
/**
 * 显示成功的弹窗组件
 * @param message 弹窗消息
 * @param description 描述信息
 */
export const displaySuccessNotification = (
  message: string,
  description?: string
) => {
  return notification["success"]({
    message,
    description,
    placement: "topLeft",
    style: {
      marginTop: 50,
    },
  });
};
/**
 * 显示失败的弹窗组件
 * @param error 错误信息
 */
export const displayErrorMessage = (error: string) => {
  return message.error(error);
};
