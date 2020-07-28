import React, { useEffect, useRef } from "react";
import { Redirect } from "react-router-dom";
import { Card, Layout, Typography, Spin } from "antd";
import { useApolloClient, useMutation } from "@apollo/react-hooks";
import {
  LogIn as LogInData,
  LogInVariables
} from "../../lib/graphql/mutations/LogIn/__generated__/LogIn";
import { AuthUrl as AuthUrlData } from "../../lib/graphql/queries/AuthUrl/__generated__/AuthUrl";
import { LOG_IN } from "../../lib/graphql/mutations";
import { AUTH_URL } from "../../lib/graphql/queries";
import { Viewer } from "../../lib/types";
import { ErrorBanner } from "../../lib/components";
import {
  displayErrorMessage,
  displaySuccessNotification,
} from "../../lib/utils";
import googleLogo from "./assets/google_logo.jpg";
const { Content } = Layout;
const { Text, Title } = Typography;

interface Props {
  setViewer: (viewer: Viewer) => void;
}

/**
 * OAuth 登录流程总结：
 * 
 * - 获取 google 登录OAuth的url地址（向GraphQL中查询OAuthUrl）
 * 
 * - 写入 window.local.href后页面会自动跳转到 Google账号登录界面
 * 
 * - 当 google 登录成功后会重定向到 login页面 并携带 code码
 * 
 * - 触发 LogIn mutation，并携带 code码 
 * 
 * - 当后端成功登录后，前端验证用户数据正确性后 既可跳转至用户界面
 * 
 */

export const Login = ({ setViewer }: Props) => {
  // 和useContext 一样，client就是那个消费者
  const client = useApolloClient();  
  const [
    logIn,
    { data: logInData, loading: logInLoading, error: logInError },
  ] = useMutation<LogInData, LogInVariables>(LOG_IN, {
    onCompleted: (data) => {
      if (data && data.logIn && data.logIn.token) {
        setViewer(data.logIn);
        sessionStorage.setItem('token',data.logIn.token)
        console.log(`登录成功，返回的数据用户数据为:`);
        console.log(data)
        displaySuccessNotification("成功登录，欢迎你的到来");
      }
    },
    onError:() => {
      console.log(`登录出错`)
      displayErrorMessage(`登录失败！`)
    }
  });
  const logInRef = useRef(logIn);
  // 获取code，开始登录
  useEffect(() => {
    // 获取code
    const code = new URL(window.location.href).searchParams.get("code");
    if (code) {
      logInRef.current({
        variables: {
          input: { code },
        },
      });
    }
  }, []);

  const handleAuthorize = async () => {
    try {
      const { data } = await client.query<AuthUrlData>({
        query: AUTH_URL,
      });
      window.location.href = data.authUrl;
    } catch (error) {
      console.log(`google 账号登录失败，发生在AuthUrl：${error}`);      
      displayErrorMessage(
        "抱歉，现在不能为您提供登录服务，查找AuthUrl时发生错误"
      );
    }
  };
  if (logInLoading) {
    return (
      <Content className="log-in">
        <Spin size="large" tip="正在登录，请稍后！" />
      </Content>
    );
  }
  if (logInData && logInData.logIn) {
    const { id: viewerId } = logInData.logIn;
    return <Redirect to={`/user/${viewerId}`} />;
  }
  const logInErrorBannerElement = logInError ? (
    <ErrorBanner description="抱歉， 稍后再试" />
  ) : null;
  return (
    <Content className="log-in">
      {logInErrorBannerElement}
      <Card className="log-in-card">
        {/* 登录选项卡 */}
        <div className="log-in-card__intro">
          <Title level={3} className="log-in-card__intro-title">
            <span role="img" aria-label="wave">
              👋
            </span>
          </Title>
          <Title level={3} className="log-in-card__intro-title">
            欢迎登录 joyful-house
          </Title>
          <Text>成功登录google账号后就可以开始创建您的订单</Text>
        </div>
        {/* 登录按钮 */}
        <button
          className="log-in-card__google-button"
          onClick={handleAuthorize}
        >
          <img
            src={googleLogo}
            alt="Google Logo"
            className="log-in-card__google-button-logo"
          />
          <span className="log-in-card__google-button-text">
            Sign in Google
          </span>
        </button>
        {/* 底部文本 */}
        <Text type="secondary">
          提示: Google 账号登录成功后，将会带您进入关于您的首页中！
        </Text>
      </Card>
    </Content>
  );
};
