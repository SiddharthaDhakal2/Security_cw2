export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 25;

export const passwordPolicyMessage =
  "Password must be 8 to 25 characters and include uppercase, lowercase, number, and symbol";

export const getPasswordChecks = (password: string) => [
  {
    label: "8 to 25 characters",
    valid: password.length >= PASSWORD_MIN_LENGTH && password.length <= PASSWORD_MAX_LENGTH,
  },
  { label: "Uppercase letter", valid: /[A-Z]/.test(password) },
  { label: "Lowercase letter", valid: /[a-z]/.test(password) },
  { label: "Number", valid: /[0-9]/.test(password) },
  { label: "Symbol", valid: /[^A-Za-z0-9]/.test(password) },
];

export const isStrongPassword = (password: string) =>
  getPasswordChecks(password).every((check) => check.valid);
