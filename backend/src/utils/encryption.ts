import crypto from "crypto";
import { DATA_ENCRYPTION_SECRET } from "../config";

const ENCRYPTION_PREFIX = "enc:v1";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

const getKey = () => crypto.createHash("sha256").update(DATA_ENCRYPTION_SECRET).digest();

export const encryptValue = (value?: string | null) => {
  if (value === undefined || value === null) {
    return value;
  }

  if (value.startsWith(`${ENCRYPTION_PREFIX}:`)) {
    return value;
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    ENCRYPTION_PREFIX,
    iv.toString("base64"),
    tag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
};

export const decryptValue = (value?: string | null) => {
  if (value === undefined || value === null) {
    return value;
  }

  if (!value.startsWith(`${ENCRYPTION_PREFIX}:`)) {
    return value;
  }

  const parts = value.split(":");
  if (parts.length !== 4) {
    return value;
  }

  const [, ivPart, tagPart, encryptedPart] = parts;

  try {
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      getKey(),
      Buffer.from(ivPart, "base64")
    );
    decipher.setAuthTag(Buffer.from(tagPart, "base64"));

    return Buffer.concat([
      decipher.update(Buffer.from(encryptedPart, "base64")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return value;
  }
};

export const encryptSensitiveUserFields = <T extends Record<string, any>>(input: T) => {
  const output = { ...input };

  if (Object.prototype.hasOwnProperty.call(output, "phone")) {
    output.phone = encryptValue(output.phone);
  }

  if (Object.prototype.hasOwnProperty.call(output, "address")) {
    output.address = encryptValue(output.address);
  }

  if (Object.prototype.hasOwnProperty.call(output, "resetOtp")) {
    output.resetOtp = encryptValue(output.resetOtp);
  }

  if (Object.prototype.hasOwnProperty.call(output, "mfaOtp")) {
    output.mfaOtp = encryptValue(output.mfaOtp);
  }

  return output;
};

export const decryptSensitiveUserFields = <T extends Record<string, any>>(input: T) => {
  const output = { ...input };

  if (Object.prototype.hasOwnProperty.call(output, "phone")) {
    output.phone = decryptValue(output.phone);
  }

  if (Object.prototype.hasOwnProperty.call(output, "address")) {
    output.address = decryptValue(output.address);
  }

  if (Object.prototype.hasOwnProperty.call(output, "resetOtp")) {
    output.resetOtp = decryptValue(output.resetOtp);
  }

  if (Object.prototype.hasOwnProperty.call(output, "mfaOtp")) {
    output.mfaOtp = decryptValue(output.mfaOtp);
  }

  return output;
};