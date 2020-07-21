import { Collection, ObjectId } from "mongodb";
//---- 用户类型定义
//----
export interface Viewer {
  _id?: string;
  token?: string;
  avatar?: string;
  walletId?: string;
  didRequest: boolean;
}
/**
 * 约束房子类型，是别墅还是民宅...
 *
 * @export
 * @enum {number}
 */
export enum ListingType {
  Apartment = "APARTMENT",
  House = "HOUSE"
}

export interface BookingsIndexMonth {
  [key: string]: boolean;
}
export interface BookingsIndexYear {
  [key: string]: BookingsIndexMonth;
}

/**
 * 对每个订单进行约束
 *
 * @export
 * @interface Booking
 */
export interface Booking {
  // 用于标识当前的订单号
  _id: ObjectId;
  // 用于标识当前对应的房子
  listing: ObjectId;
  // --- 以下字段用于标识：某用户的入住时间和退房信息
  tenant: string;
  checkIn: string;
  checkOut: string;
  // ---
}
/**
 * 对每个房子进行类型约束
 *
 * @export
 * @interface Listing
 */
export interface Listing {
  _id: ObjectId;
  title: string;
  description: string;
  image: string;
  // PUZZ:房子拥有者？
  host: string;
  type: ListingType;
  // --- 以下字段用于Google地图定位
  address: string;
  country: string;
  admin: string;
  city: string;
  // ---
  bookings: ObjectId[];
  // PUZZ:用于定义房子的日程？如果接客，设置为true？
  bookingsIndex: BookingsIndexYear;
  price: number;
  // 能够接客的人数
  numOfGuests: number;
}
/**
 * 对用户数据进行类型约束
 *
 * @export
 * @interface User
 *
 * 以下两个字段是一对多关系:
 *
 * bookings： 一个用户可以有多个预定民宿
 *
 * listings： 一个用户可以拥有多个民宿进行出售
 */
export interface User {
  _id: string;
  token: string;
  name: string;
  avatar: string;
  contact: string;
  walletId?: string;
  // 用户的所有收入
  income: number;
  bookings: ObjectId[];
  listings: ObjectId[];
  authorized?: boolean;
}
export interface Database {
  bookings: Collection<Booking>;
  listings: Collection<Listing>;
  users: Collection<User>;
}

/**
 * 每个订单的数据接口
 */
export interface Listing {
  _id: ObjectId;
  title: string;
  description: string;
  image: string;
  host: string;
  type: ListingType;
  address: string;
  country: string;
  admin: string;
  city: string;
  bookings: ObjectId[];
  bookingsIndex: BookingsIndexYear;
  price: number;
  numOfGuests: number;
  authorized?: boolean;
}
