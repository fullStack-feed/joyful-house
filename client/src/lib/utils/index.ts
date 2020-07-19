import { message, notification } from "antd";

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
