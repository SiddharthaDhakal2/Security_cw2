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

export const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "7d";

export const BCRYPT_SALT_ROUNDS: number = process.env.BCRYPT_SALT_ROUNDS
  ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10)
  : 10;

export const KHALTI_SECRET_KEY: string = process.env.KHALTI_SECRET_KEY || "";
export const KHALTI_RETURN_URL: string = process.env.KHALTI_RETURN_URL || "";
export const KHALTI_WEBSITE_URL: string =
  process.env.KHALTI_WEBSITE_URL ||
  process.env.FRONTEND_URL ||
  "http://localhost:3000";