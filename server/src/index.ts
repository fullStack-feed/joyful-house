// require("dotenv").config();
import compression from "compression";
import express, { Application } from "express";
import bodyParser from "body-parser";
import { ApolloServer } from "apollo-server-express";
import { connectDatabase } from "./database";
import { typeDefs, resolvers } from "./graphql";
import cookieParser from "cookie-parser";

const mount = async (app: Application) => {
  const db = await connectDatabase();
  app.use(bodyParser.json({ limit: "2mb" }));
  // 对客户端文件进行压缩？这里不懂
  app.use(compression());
  // 处理cookie 持久化登录的中间件
  app.use(cookieParser(process.env.SECRET));
  // 静态请求全部走client代码
  app.use(express.static(`${__dirname}/client`));
  app.get("/*", (_req, res) => res.sendFile(`${__dirname}/client/index.html`));
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    // PUZZ: 纳闷，这里的res 和 req怎么传过来的呢？
    context: ({ res, req }) => ({ db, res, req }),
  });

  server.applyMiddleware({ app, path: "/api" });
  app.listen(process.env.PORT);

  console.log(`[app] : http://localhost:${process.env.PORT}`);
};

mount(express());

// Note: You will need to introduce a .env file at the root of the project
// that has the PORT, DB_USER, DB_USER_PASSWORD, and DB_CLUSTER environment variables defined.
// Otherwise, the server will not be able to start and/or connect to the database
