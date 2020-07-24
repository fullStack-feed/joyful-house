import {IResolvers} from "apollo-server-express";
import {Request} from 'express'
import {Listing, Database, User, ListingType} from "../../../lib/types";
import {
  HostListingArgs, HostListingInput,
  ListingArgs,
  ListingBookingsArgs,
  ListingBookingsData,
  ListingsArgs,
  ListingsData,
  ListingsFilter,
  ListingsQuery
} from "./types";
import {ObjectId} from "mongodb";
import {authorize} from "../../../lib/utils";
import {Google} from "../../../lib/api";

const verifyHostListingInput =
  ({
     title,
     description,
     type,
     price
   }: HostListingInput) => {
    if (title.length > 100) {
      throw new Error("房子名称过长");
    }
    if (description.length > 5000) {
      throw new Error("描述信息过长");
    }
    if (type !== ListingType.Apartment && type !== ListingType.House) {
      throw new Error("房子类型不符");
    }
    if (price < 0) {
      throw new Error("房子的价钱不能小于0");
    }
  };
export const listingResolvers: IResolvers = {
  Query: {
    listing: async (
      _root: undefined,
      {id}: ListingArgs,
      {db, req}: { db: Database; req: Request }
    ): Promise<Listing> => {
      //  根据id获取
      try {
        const listing = await db.listings.findOne({_id: new ObjectId(id)});
        if (!listing) {
          throw new Error("listing can't be found");
        }
        //权限校验
        const viewer = await authorize(db, req);
        if (viewer && viewer._id === listing.host) {
          listing.authorized = true;
        }
        return listing
      } catch (error) {
        throw new Error(`Failed to query listing: ${error}`);
      }
    },
    listings: async (
      _root: undefined,
      {location, filter, limit, page}: ListingsArgs,
      {db}: { db: Database }
    ): Promise<ListingsData> => {
      try {
        // 用于根据用户输入的地理进行筛选；
        const query: ListingsQuery = {};
        const data: ListingsData = {
          region: null,
          total: 0,
          result: []
        };
        console.log(`location is:`, location)
        if (location) {
          try {
            const {country, admin, city} = await Google.geocode(location);
            console.log(`这里就出错了`)
            if (city) query.city = city;
            if (admin) query.admin = admin;
            if (country) {
              query.country = country;
            } else {
              throw new Error("no country found");
            }
            const cityText = city ? `${city}, ` : "";
            const adminText = admin ? `${admin}, ` : "";
            data.region = `${cityText}${adminText}${country}`;
          } catch (e) {
            console.log(`谷歌搜索链接失败`, e)
          }
        }
        // 查询所有数据
        let cursor = await db.listings.find(query);
        if (filter && filter === ListingsFilter.PRICE_LOW_TO_HIGH) {
          // filter listings from price low to high
          cursor = cursor.sort({price: 1});
        }

        if (filter && filter === ListingsFilter.PRICE_HIGH_TO_LOW) {
          // filter listings from price high to low
          cursor = cursor.sort({price: -1});
        }
        cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0);
        cursor = cursor.limit(limit);
        data.total = await cursor.count();
        data.result = await cursor.toArray();

        return data;
      } catch (error) {
        throw new Error(`Failed to query listings: ${error}`);
      }
    }
  },
  Mutation: {
    hostListing: async (
      _root: undefined,
      {input}: HostListingArgs,
      {db, req}: { db: Database; req: Request }
    ): Promise<Listing> => {
      // ...
      //  1. 对前端传递过来的form数据进行校验
      verifyHostListingInput(input);
      //  2. 对用户信息进行校验，防止非法登陆
      let viewer = await authorize(db, req);
      // 如果用户不存在直接抛出异常
      if (!viewer) {
        throw new Error("viewer cannot be found");
      }
      const { country, admin, city } = await Google.geocode(input.address);
      // FIXME: 由于地理信息查询有问题，这里的内容会查不到，先给一个空串
      if (!country || !admin || !city) {
        console.log('google 地理查询失败')
      }
    //  3. 向数据库存储内容
      console.log(`开始向数据库写入房子信息`)
      const insertResult = await db.listings.insertOne({
        _id: new ObjectId(),
        ...input,
        bookings: [],
        bookingsIndex: {},
        country : 'mock',
        admin : 'mock',
        city : 'mock',
        host: viewer._id
      });
      // 4. 向数据库中对应的用户信息中插入房子内容
      const insertedListing: Listing = insertResult.ops[0];

      await db.users.updateOne(
        { _id: viewer._id },
        { $push: { listings: insertedListing._id } }
      );
      // 5. 将处理完毕的房子信息返回
      return insertedListing;
    }
  },
  Listing: {
    id: (listing: Listing): string => {
      return listing._id.toString();
    },
    host: async (
      listing: Listing,
      _args: {},
      {db}: { db: Database }
    ): Promise<User> => {
      const host = await db.users.findOne({_id: listing.host});
      if (!host) {
        throw new Error("host can't be found");
      }
      return host;
    },
    bookingsIndex: (listing: Listing): string => {
      return JSON.stringify(listing.bookingsIndex);
    },
    // 提供分页功能
    bookings: async (
      listing: Listing,
      {limit, page}: ListingBookingsArgs,
      {db}: { db: Database }
    ): Promise<ListingBookingsData | null> => {
      try {
        // 只有用户自己才能够查阅该房子的订阅历史
        if (!listing.authorized) {
          return null;
        }
        const data: ListingBookingsData = {
          total: 0,
          result: []
        };
        let cursor = await db.bookings.find({
          _id: {$in: listing.bookings}
        });
        cursor = cursor.skip(page > 0 ? (page - 1) * limit : 0);
        cursor = cursor.limit(limit);
        data.total = await cursor.count();
        data.result = await cursor.toArray();
        return data;
      } catch (error) {
        throw new Error(`Failed to query listing bookings: ${error}`);
      }
    }
  }
}



