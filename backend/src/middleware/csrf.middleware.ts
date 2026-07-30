import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { JWT_SECRET } from "../config";
import { HttpError } from "../errors/http-error";

const CSRF_COOKIE_NAME = "csrfSecret";
const CSRF_HEADER_NAME = "x-csrf-token";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const parseCookies = (cookieHeader = "") => {
  return cookieHeader.split(";").reduce<Record<string, string>>((cookies, part) => {
    const [rawName, ...rawValue] = part.trim().split("=");
    if (!rawName || rawValue.length === 0) return cookies;

    cookies[rawName] = decodeURIComponent(rawValue.join("="));
    return cookies;
  }, {});
};

const createSecret = () => crypto.randomBytes(32).toString("hex");

const getCookieOptions = () => {
  const parts = [
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=86400",
  ];

  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
};

const setCsrfSecretCookie = (res: Response, secret: string) => {
  res.setHeader("Set-Cookie", `${CSRF_COOKIE_NAME}=${encodeURIComponent(secret)}; ${getCookieOptions()}`);
};

const signToken = (secret: string, nonce: string) => {
  return crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${secret}:${nonce}`)
    .digest("hex");
};

const createToken = (secret: string) => {
  const nonce = crypto.randomBytes(16).toString("hex");
  return `${nonce}.${signToken(secret, nonce)}`;
};

const safeEqual = (a: string, b: string) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

const isValidToken = (secret: string, token: string) => {
  const [nonce, signature] = token.split(".");
  if (!nonce || !signature) return false;

  return safeEqual(signature, signToken(secret, nonce));
};

const getCsrfSecret = (req: Request, res: Response) => {
  const cookies = parseCookies(req.headers.cookie);
  const existing = cookies[CSRF_COOKIE_NAME];

  if (existing) return existing;

  const secret = createSecret();
  setCsrfSecretCookie(res, secret);
  return secret;
};

export const csrfTokenHandler = (req: Request, res: Response) => {
  const secret = getCsrfSecret(req, res);

  return res.status(200).json({
    success: true,
    csrfToken: createToken(secret),
  });
};

export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  if (SAFE_METHODS.has(req.method.toUpperCase())) {
    return next();
  }

  const cookies = parseCookies(req.headers.cookie);
  const secret = cookies[CSRF_COOKIE_NAME];
  const token = req.get(CSRF_HEADER_NAME);

  if (!secret || !token || !isValidToken(secret, token)) {
    return next(new HttpError(403, "Invalid CSRF token"));
  }

  return next();
};
