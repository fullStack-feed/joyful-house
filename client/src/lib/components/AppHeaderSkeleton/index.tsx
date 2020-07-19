import React from "react";
import { Layout } from "antd";
import logo from "./assets/tinyhouse-logo.png";
const { Header } = Layout;
export const AppHeaderSkeleton = () => {
  return (
    <Header className="app-header">
      <div className="app-header__logo-search-section">
        <div className="app-header__logo">
          <img src={logo} alt="App logo" />
        </div>
      </div>
    </Header>
  );
};
