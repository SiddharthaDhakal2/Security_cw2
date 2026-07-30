import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// .env uses MONGO_URI, not MONGODB_URI
export const MONGODB_URI: string = process.env.MONGO_URI as string;

if (!MONGODB_URI) {
  throw new Error("MONGO_URI is missing in .env");
}

export const JWT_SECRET: string = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in .env");
}

const parseDurationToSeconds = (value: string) => {
  const match = value.trim().match(/^(\d+)([smhd])$/i);

  if (!match) {
    return 0;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  if (unit === "s") return amount;
  if (unit === "m") return amount * 60;
  if (unit === "h") return amount * 60 * 60;
  if (unit === "d") return amount * 24 * 60 * 60;

  return 0;
};

export const JWT_ACCESS_EXPIRES_IN: string = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
export const JWT_REFRESH_EXPIRES_IN: string = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
export const JWT_EXPIRES_IN: string = JWT_ACCESS_EXPIRES_IN;
export const JWT_ACCESS_MAX_AGE_SECONDS: number =
  parseDurationToSeconds(JWT_ACCESS_EXPIRES_IN) || 15 * 60;
export const JWT_REFRESH_MAX_AGE_SECONDS: number =
  parseDurationToSeconds(JWT_REFRESH_EXPIRES_IN) || 7 * 24 * 60 * 60;
export const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || `${JWT_SECRET}_refresh`;

export const BCRYPT_SALT_ROUNDS: number = process.env.BCRYPT_SALT_ROUNDS
  ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10)
  : 10;

export const KHALTI_SECRET_KEY: string = process.env.KHALTI_SECRET_KEY || "";
export const KHALTI_API_BASE_URL: string =
  process.env.KHALTI_API_BASE_URL || "https://dev.khalti.com/api/v2/epayment";
export const KHALTI_RETURN_URL: string = process.env.KHALTI_RETURN_URL || "";
export const KHALTI_WEBSITE_URL: string =
  process.env.KHALTI_WEBSITE_URL ||
  process.env.FRONTEND_URL ||
  "http://localhost:3000";
