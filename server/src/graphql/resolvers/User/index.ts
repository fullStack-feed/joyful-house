import {IResolvers} from 'apollo-server-express'
import {UserArgs, UserBookingArgs, UserBookingsData, UserListingsArgs, UserListingsData} from "./types";
import {Database, User} from "../../../lib/types";
import {Request} from 'express'
import {authorize} from "../../../lib/utils";

export const userResolvers: IResolvers = {
  Query: {
    user: async (
      _root: undefined,
      {id}: UserArgs,
      {db, req}: { db: Database; req: Request }
    ): Promise<User> => {
      try {
        const user = await db.users.findOne({_id: id});
        if (!user) {
          throw new Error("user can't be found");
        }
        // 查看用户信息时，需要验证用户是否拥有权力，防止CSRF攻击
        const viewer = await authorize(db, req);
        if (viewer && viewer._id === user._id) {
          user.authorized = true;
        }
        return user;
      } catch (error) {
        throw new Error(`Failed to query user: ${error}`);
      }
    }
  },
  // TODO:
  // 可以理解为：当用户查询到User中的某一个字段时，经过一系列处理后才会返回。
  User: {
    id: (user: User): string => {
      return user._id;
    },
    hasWallet: (user: User): boolean => {
      return Boolean(user.walletId);
    },
    income: (user: User): number | null => {
      return user.authorized ? user.income : null;
    },
    // PUZZ: ！分页逻辑
    bookings: async (
      user: User,
      {limit, page}: UserBookingArgs,
      {db}: { db: Database }
    ): Promise<UserBookingsData | null> => {
      try {
        if (!user.authorized) {
          return null;
        }
        const data: UserBookingsData = {
          total: 0,
          result: []
        };
        // 分页逻辑1：找到用户的所有订阅
        let cursor = await db.bookings.find({
          _id: { $in: user.bookings }
        });
        // 分页逻辑2： 根据page、limit 进行分页计算，获取后续分页的所有数据
        cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0);
        // 分页逻辑3： 根据limit 返回应该被渲染的数量
        cursor = cursor.limit(limit);
        // PUZZ:分页逻辑4： 根据cursor获取分页后还有的总数量？
        data.total = await cursor.count();
        data.result = await cursor.toArray();
        return data;
      } catch(error) {
        throw new Error(`Failed to query user bookings: ${error}`);
      }
    },
    listings: async (
      user: User,
      { limit, page }: UserListingsArgs,
      { db }: { db: Database }
    ): Promise<UserListingsData | null> => {
      try {
        const data: UserListingsData = {
          total: 0,
          result: []
        };
        let cursor = await db.listings.find({
          _id: { $in: user.listings }
        });

        cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0);
        cursor = cursor.limit(limit);

        data.total = await cursor.count();
        data.result = await cursor.toArray();

        return data;
      } catch (error) {
        throw new Error(`Failed to query user listings: ${error}`);
      }
    }
  }
}
