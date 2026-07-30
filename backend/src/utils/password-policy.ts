export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 25;
export const PASSWORD_HISTORY_LIMIT = 3;
export const PASSWORD_EXPIRY_DAYS = 60;

export const passwordPolicyMessage =
  "Password must be 8 to 25 characters and include uppercase, lowercase, number, and symbol";

export const isStrongPassword = (password: string) =>
  password.length >= PASSWORD_MIN_LENGTH &&
  password.length <= PASSWORD_MAX_LENGTH &&
  /[a-z]/.test(password) &&
  /[A-Z]/.test(password) &&
  /[0-9]/.test(password) &&
  /[^A-Za-z0-9]/.test(password);

export const getPasswordExpiryDate = () =>
  new Date(Date.now() + PASSWORD_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

export const getPasswordExpiryDateFrom = (from: Date) =>
  new Date(from.getTime() + PASSWORD_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
