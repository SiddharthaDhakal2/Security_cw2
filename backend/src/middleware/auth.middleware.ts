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
    const cookieHeader = req.headers.cookie || "";
    const cookieToken = cookieHeader
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("token="))
      ?.split("=")[1];

    let token = "";

    if (header && header.startsWith("Bearer ")) {
      token = header.split(" ")[1];
    } else if (cookieToken) {
      token = decodeURIComponent(cookieToken);
    }

    if (!token) {
      return next(new HttpError(401, "Unauthorized"));
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload & { tokenType?: string };

    if (decoded.tokenType && decoded.tokenType !== "access") {
      return next(new HttpError(401, "Unauthorized"));
    }

    (req as any).user = decoded;
    next();
  } catch {
    next(new HttpError(401, "Unauthorized"));
  }
};
