import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { HttpError } from "../errors/http-error";

export type AuthUserPayload = {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: "user" | "admin";
};

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return next(new HttpError(401, "Unauthorized"));
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;

    (req as any).user = decoded;
    next();
  } catch {
    next(new HttpError(401, "Unauthorized"));
  }
};
