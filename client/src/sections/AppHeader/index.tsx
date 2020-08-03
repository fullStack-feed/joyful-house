import React, {useEffect, useState} from "react";
import {Link, withRouter, RouteComponentProps} from "react-router-dom";
import {Layout, Input} from "antd";

import logo from "./assets/tinyhouse-logo.png";
import {Viewer} from "../../lib/types";
import {MenuItems} from "./components";
import {displayErrorMessage} from "../../lib/utils";

const {Search} = Input
const {Header} = Layout;
/**
 *
 * 之所以需要setViewer，是因为需要处理登出逻辑
 * @interface Props
 */
interface Props {
  viewer: Viewer;
  setViewer: (viewer: Viewer) => void;
}

export const AppHeader = withRouter(({viewer, setViewer, location, history}: Props & RouteComponentProps) => {
    const [search, setSearch] = useState("");
    const [searchView, setSearchView] = useState(true)
    useEffect(() => {
      const {pathname} = location;
      const pathnameSubStrings = pathname.split('/')
      if (!pathname.includes("/listings")) {
        setSearch("");
        return;
      }      
      if (pathname.includes("/listings") && pathnameSubStrings.length === 3) {
        setSearch(pathnameSubStrings[2]);
        return;
      }
    }, [location]);
    const onSearch = (value: string) => {
      const trimmedValue = value.trim();
      if (trimmedValue) {
        history.push(`/listings/${trimmedValue}`);
      } else {
        displayErrorMessage("请输入一个有效的搜索内容");
      }
    };
    return (
      <Header className="app-header">
        <div className="app-header__logo-search-section">
          <div className="app-header__logo">
            <Link to="/">
              <img src={logo} alt="App logo"/>
            </Link>
          </div>
          <div className="app-header__search-input">
            {searchView ? <Search
              placeholder="Search 'San Fransisco'"
              enterButton
              value={search}
              onChange={evt => setSearch(evt.target.value)}
              onSearch={onSearch}/> : null}
          </div>
        </div>
        <div className="app-header__menu-section">
          <MenuItems viewer={viewer} setViewer={setViewer}/>
        </div>
      </Header>
    );
  }
)
