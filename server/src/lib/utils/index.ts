import {Database} from "../types";
import {Request} from 'express'

/**
 * 用于防止CSRF攻击的校验函数
 */
export const authorize = async (db: Database, req: Request): Promise<User | null> => {
  const token = req.get("X-CSRF-TOKEN");
  const viewer = await db.users.findOne({
    _id: req.signedCookies.viewer,
    token
  })
  return viewer;
}
