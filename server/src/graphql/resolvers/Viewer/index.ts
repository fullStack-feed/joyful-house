import { Response, Request } from "express";
import { LogInArgs } from "./types";
import { IResolvers } from "apollo-server-express";
import { Viewer, Database, User } from "../../../lib/types";
import { Google } from "../../../lib/api";
import crypto from "crypto";
/**
 * 要写入的cookie字段
 */
const cookieOptions = {
  httpOnly: true, // 防止XSS攻击
  sameSite: true, // 防止CSRF攻击
  signed: true, //PUZZ:signed不理解这个字段
  secure: process.env.NODE_ENV === "development" ? false : true, // PUZZ: 不理解
};

const logInViaGoogle = async (
  code: string,
  token: string,
  db: Database,
  res: Response
): Promise<User | undefined> => {
  const { user } = await Google.logIn(code);
  if (!user) {
    throw new Error("谷歌登录失败");
  }
  console.log(`谷歌认证成功，获取到用户数据为：`);
  console.log(user)
  const userNamesList = user.names && user.names.length ? user.names : null;
  const userPhotosList = user.photos && user.photos.length ? user.photos : null;
  const userEmailsList =
    user.emailAddresses && user.emailAddresses.length
      ? user.emailAddresses
      : null;
  // User Display Name
  const userName = userNamesList ? userNamesList[0].displayName : null;

  // User Id
  const userId =
    userNamesList &&
    userNamesList[0].metadata &&
    userNamesList[0].metadata.source
      ? userNamesList[0].metadata.source.id
      : null;

  // User Avatar
  const userAvatar =
    userPhotosList && userPhotosList[0].url ? userPhotosList[0].url : null;

  // User Email
  const userEmail =
    userEmailsList && userEmailsList[0].value ? userEmailsList[0].value : null;

  if (!userId || !userName || !userAvatar || !userEmail) {
    throw new Error("谷歌用户数据出错");
  }
  // 从数据库中获取用户信息
  const updateRes = await db.users.findOneAndUpdate(
    { _id: userId },
    {
      $set: {
        name: userName,
        avatar: userAvatar,
        contact: userEmail,
        token,
      },
    },
    { returnOriginal: false }
  );
  let viewer = updateRes.value;
  // 如果没有用户信息，则向数据库中存入用户信息
  if (!viewer) {
    console.log(`开始向数据库存入数据`);
    const insertResult = await db.users.insertOne({
      _id: userId,
      token,
      name: userName,
      avatar: userAvatar,
      contact: userEmail,
      income: 0,
      bookings: [],
      listings: [],
    });
    console.log(`存入数据成功`);
    viewer = insertResult.ops[0];
  }
  console.log(`开始写入cookie`)
  // 返回viewer前，将cookie 写入并返回给前端
  res.cookie("viewer", userId, {
    ...cookieOptions,
    maxAge: 365 * 24 * 60 * 60 * 1000,
  });
  return viewer;
};
const logInViaCookie = async (
  token: string,
  db: Database,
  req: Request,
  res: Response
): Promise<User | undefined> => {
  // 检查数据库中该用户是否登录过
  const updateRes = await db.users.findOneAndUpdate(
    { _id: req.signedCookies.viewer },
    { $set: { token } },
    { returnOriginal: false }
  );
  let viewer = updateRes.value;
  // PUZZ: 没有从数据库中查到用户信息，为什么要清除这个cookie？
  if (!viewer) {
    res.clearCookie("viewer", cookieOptions);
  }
  return viewer;
};
export const viewerResolvers: IResolvers = {
  Query: {
    authUrl: (): string => {
      try {
        return Google.authUrl;
      } catch (error) {
        throw new Error(`获取Google的authUrl出现错误${error}`);
      }
    },
  },
  Mutation: {
    /**
     *
     * Where the viewer signs-in with the Google authentication url and consent screen.
     * Where the viewer signs-in with their cookie session.
     *
     * 现在实现的功能：
     * - Authenticate with Google OAuth.
     * - Either update or insert the viewer in the database.
     * - And return the viewer and viewer details for the client to receive.
     */
    logIn: async (
      _root: undefined,
      { input }: LogInArgs,
      { db, res, req }: { db: Database; req: Request; res: Response }
    ): Promise<Viewer> => {
      try {
        // 获取用户用于登录的code
        const code = input ? input.code : null;
        console.log(`从客户端传递过来的参数用于授权的code为: ${code}`);
        // TODO: CSRF 攻击
        const token = crypto.randomBytes(16).toString("hex");

        // 如果本次登录没有携带code，要么是刷新页面，要么是二次登录，走cookie持久化登录

        const viewer: User | undefined = code
          ? await logInViaGoogle(code, token, db, res)
          : await logInViaCookie(token, db, req, res);
        if (!viewer) {
          return { didRequest: true };
        }
        return {
          _id: viewer._id,
          token: viewer.token,
          avatar: viewer.avatar,
          walletId: viewer.walletId,
          didRequest: true,
        };
      } catch (error) {
        throw new Error(`登录失败: ${error}`);
      }
    },
    logOut: (
      _root: undefined,
      _args: {},
      { res }: { res: Response }
    ): Viewer => {
      try {
        // 用户注销时，手动清理cookie
        res.clearCookie("viewer", cookieOptions);
        return { didRequest: false };
      } catch (error) {
        throw new Error(`注销失败: ${error}`);
      }
    },
  },
  // PUZZ: 不明白为什么这里可以给type 类型的 Viewer 设置函数，这是在干嘛？
  Viewer: {
    id: (viewer: Viewer): string | undefined => {
      return viewer._id;
    },
    hasWallet: (viewer: Viewer): boolean | undefined => {
      return viewer.walletId ? true : undefined;
    },
  },
};
