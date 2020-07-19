import React from "react";
import { Link } from "react-router-dom";
import { Layout } from "antd";

import logo from "./assets/tinyhouse-logo.png";
import { Viewer } from "../../lib/types";
import { MenuItems } from "./components";
/**
 *
 * 之所以需要setViewer，是因为需要处理登出逻辑
 * @interface Props
 */
interface Props {
  viewer: Viewer;
  setViewer: (viewer: Viewer) => void;
}
const { Header } = Layout;
export const AppHeader = ({ viewer, setViewer }: Props) => {
  return (
    <Header className="app-header">
      {/* logo */}
      <div className="app-header__logo-search-section">
        <div className="app-header__logo">
          <Link to="/">
            <img src={logo} alt="App logo" />
          </Link>
        </div>
      </div>
      {/* Menu信息 */}
      <div className="app-header__menu-section">
        <MenuItems viewer={viewer} setViewer={setViewer} />
      </div>
    </Header>
  );
};
