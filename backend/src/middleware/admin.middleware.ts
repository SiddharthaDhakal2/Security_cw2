import { Request, Response, NextFunction } from "express";
import { HttpError } from "../errors/http-error";

export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user) return next(new HttpError(401, "Unauthorized"));
  if (user.role !== "admin") return next(new HttpError(403, "Forbidden (admin only)"));
  next();
};
