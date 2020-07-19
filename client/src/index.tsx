import React, { useState } from "react";
import { render } from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import {
  Home,
  Host,
  Listing,
  Listings,
  User,
  NotFound,
  AppHeader,
} from "./sections";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";
import * as serviceWorker from "./serviceWorker";
import "./styles/index.css";
import { Login } from "./sections/Login";
import { Layout, Affix } from "antd";
import { Viewer } from "./lib/types";

const client = new ApolloClient({
  uri: "/api",
});

const initialViewer: Viewer = {
  id: null,
  token: null,
  avatar: null,
  hasWallet: null,
  didRequest: false,
};

// 用于存储登录状态

const App = () => {
  // 由于initialViewer定义了类型，所以不需要给useState再加类型
  const [viewer, setViewer] = useState(initialViewer);
  // PUZZ: 不明白react-router的render props 模式
  return (
    <Router>
      <Layout id="app">
        <Affix offsetTop={0} className="app__affix-header">
          <AppHeader viewer={viewer} setViewer={setViewer} />
        </Affix>
        <Switch>
          <Route exact path="/" component={Home}></Route>
          <Route exact path="/host" component={Host} />
          <Route
            exact
            path="/login"
            render={(props) => <Login {...props} setViewer={setViewer} />}
          />
          {/* 动态路由，根据不同用户id显示不同Listing页面 */}
          <Route exact path="/listing/:id" component={Listing} />
          {/* ? 表示location字段可有可无 */}
          <Route exact path="/listings/:location?" component={Listings} />
          <Route exact path="/user/:id" component={User} />
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </Router>
  );
};

render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
