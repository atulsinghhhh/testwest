import type { IUser } from "../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      validated?: {
        body?: Record<string, unknown>;
        params?: Record<string, string>;
        query?: Record<string, string | string[]>;
      };
    }
  }
}

export {};
