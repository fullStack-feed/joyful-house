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
export const Login = ({ setViewer }: Props) => {
  // 和useContext 一样，client就是那个消费者
  const client = useApolloClient();
  //PUZZ: 解构语法和ts的类型定义语法会冲突吗？
  const [
    logIn,
    { data: logInData, loading: logInLoading, error: logInError },
  ] = useMutation<LogInData, LogInVariables>(LOG_IN, {
    onCompleted: (data) => {
      if (data && data.logIn && data.logIn.token) {
        setViewer(data.logIn);
        sessionStorage.setItem('token',data.logIn.token)
        console.log(`登录成功，返回的数据用户数据为：`);
        console.log(data)
        displaySuccessNotification("成功登录，欢迎到来");
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
      displayErrorMessage(
        "Sorry! We weren't able to log you in. Please try again later!"
      );
    }
  };
  if (logInLoading) {
    return (
      <Content className="log-in">
        <Spin size="large" tip="Logging you in..." />
      </Content>
    );
  }
  if (logInData && logInData.logIn) {
    const { id: viewerId } = logInData.logIn;
    return <Redirect to={`/user/${viewerId}`} />;
  }
  const logInErrorBannerElement = logInError ? (
    <ErrorBanner description="Sorry! We weren't able to log you in. Please try again later!" />
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
            Log in to TinyHouse!
          </Title>
          <Text>Sign in with Google to start booking available rentals!</Text>
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
            Sign in with Google
          </span>
        </button>
        {/* 底部文本 */}
        <Text type="secondary">
          Note: By signing in, you'll be redirected to the Google consent form
          to sign in with your Google account.
        </Text>
      </Card>
    </Content>
  );
};
