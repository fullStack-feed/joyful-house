import {IResolvers} from "apollo-server-express";
import { CreateBookingArgs } from "./types";
import { Request } from "express";
import {authorize} from "../../../lib/utils";
import { ObjectId } from "mongodb";
import { Stripe } from "../../../lib/api";
import { Database, Listing, Booking, BookingsIndex } from "../../../lib/types";
export const resolveBookingsIndex = (
  bookingsIndex: BookingsIndex,
  checkInDate: string,
  checkOutDate: string
): BookingsIndex => {
  let dateCursor = new Date(checkInDate);
  let checkOut = new Date(checkOutDate);
  const newBookingsIndex: BookingsIndex = { ...bookingsIndex };

  while (dateCursor <= checkOut) {
    const y = dateCursor.getUTCFullYear();
    const m = dateCursor.getUTCMonth();
    const d = dateCursor.getUTCDate();

    if (!newBookingsIndex[y]) {
      newBookingsIndex[y] = {};
    }

    if (!newBookingsIndex[y][m]) {
      newBookingsIndex[y][m] = {};
    }

    if (!newBookingsIndex[y][m][d]) {
      newBookingsIndex[y][m][d] = true;
    } else {
      throw new Error("选择的日期已经被人预定，请检查前端代码是否出现bug！");
    }

    dateCursor = new Date(dateCursor.getTime() + 86400000);
  }
  return newBookingsIndex;
};
export const bookingResolvers: IResolvers = {
  Mutation: {
    /**
     * 1.校验用户是否正常登陆
     * 2.在数据库中找到该房屋的id，并验证是否存在
     * 3.检查是否自己订阅自己的商品
     * 4.检查订单日期是否满足checkIn < checkOut
     *
     *
     * 5.根据房间已经订阅（bookingsIndex）和预定（checkIn和checkOut）来更新（bookingsIndex）
     * 6.根据天数计算商品总价
     * 7.在数据库中根据listing.host字段找到房东，并检查当前房东是否有效以及Stripe的状态
     * 8.向房东进行Stripe转账交易
     *
     *
     * 9.向数据库 bookings 中 写入此次订单的信息
     * 10.向数据库user中 更新房东总收入
     * 11.更新数据库user中 更新"viewer" 的订单信息
     * 12.更新数据库listings中 当前房子的被订阅时间，以及对应的订单信息
     *
     *
     * @param _root
     * @param input
     * @param db
     * @param req
     */
    createBooking: async (
      _root: undefined,
      { input }: CreateBookingArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<Booking> => {
      try {

        const { id, source, checkIn, checkOut } = input;

        let viewer = await authorize(db, req);
        if (!viewer) {
          throw new Error("viewer不是有效登陆");
        }
        const listing = await db.listings.findOne({
          _id: new ObjectId(id)
        });
        if (!listing) {
          throw new Error("在数据库中查找不到当前的listing");
        }
        if (listing.host === viewer._id) {
          throw new Error("无法自己订阅自己的房间");
        }
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        if (checkOutDate < checkInDate) {
          throw new Error("不能订阅，日期无效，checkout提前与checkIn");
        }
        const bookingsIndex = resolveBookingsIndex(listing.bookingsIndex, checkIn, checkOut);
        const totalPrice =
          listing.price * ((checkOutDate.getTime() - checkInDate.getTime()) / 86400000 + 1);
        const host = await db.users.findOne({
          _id: listing.host
        });
        if (!host || !host.walletId) {
          throw new Error("房东找不到或者房东没有连接到Stripe");
        }
        await Stripe.charge(totalPrice, source, host.walletId);
        const insertRes = await db.bookings.insertOne({
          _id: new ObjectId(),
          listing: listing._id,
          tenant: viewer._id,
          checkIn,
          checkOut
        });

        const insertedBooking: Booking = insertRes.ops[0];

        await db.users.updateOne({ _id: host._id }, { $inc: { income: totalPrice } });

        await db.users.updateOne(
          { _id: viewer._id },
          { $push: { bookings: insertedBooking._id } }
        );
        await db.listings.updateOne(
          { _id: listing._id },
          {
            $set: { bookingsIndex },
            $push: { bookings: insertedBooking._id }
          }
        );
        return insertedBooking;
      } catch (error) {
        throw new Error(`创建一个订单时出现错误: ${error}`);
      }
    }
  },
  Booking: {
    id: (booking: Booking): string => {
      return booking._id.toString();
    },
    listing:
      (booking: Booking,
       _args: {},
       {db}: { db: Database }
      ): Promise<Listing | null> => {
        return db.listings.findOne({_id: booking.listing})
      },
    tenant: (booking: Booking, _args: {}, { db }: { db: Database }) => {
      return db.users.findOne({ _id: booking.tenant });
    }
  }
}
