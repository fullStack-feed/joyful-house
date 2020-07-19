import { LogInArgs } from "./types";
import { IResolvers } from "apollo-server-express";
import { Viewer, Database, User } from "../../../lib/types";
import { Google } from "../../../lib/api";
import crypto from "crypto";
const logInViaGoogle = async (
  code: string,
  token: string,
  db: Database
): Promise<User | undefined> => {
  const { user } = await Google.logIn(code);
  if (!user) {
    throw new Error("谷歌登录失败");
  }
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
    throw new Error("Google login error");
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
    viewer = insertResult.ops[0];
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
      { db }: { db: Database }
    ): Promise<Viewer> => {
      try {
        // 获取用户用于登录的code
        const code = input ? input.code : null;
        // TODO: CSRF 攻击
        const token = crypto.randomBytes(16).toString("hex");
        const viewer: User | undefined = code
          ? await logInViaGoogle(code, token, db)
          : undefined;
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
    logOut: (): Viewer => {
      try {
        return { didRequest: false };
      } catch (error) {
        throw new Error(`注销失败: ${error}`);
      }
    },
  },
  // 不明白为什么这里可以给type 类型的 Viewer 设置函数，这是在干嘛？
  Viewer: {
    id: (viewer: Viewer): string | undefined => {
      return viewer._id;
    },
    hasWallet: (viewer: Viewer): boolean | undefined => {
      return viewer.walletId ? true : undefined;
    },
  },
};
