export const STORAGE_KEYS = {
  TOKEN: "__lockout_token",
} as const;

export const QUERY_KEYS = {
  REGISTER: "register",
  SIGN_IN: "sign-in",
  VERIFY_OTP: "verify-otp",
  RESEND_OTP: "resend-otp",
  ME: "me",
  HISTORY: "history",
  KEY: "key",

  LOCATION: "location",
  LOCATIONS: "locations",

  ACCQUIRE_LOCKER: "accquire",
  RELEASE_LOCKER: "release",
  OPEN_LOCKER: "open",
  CLOSE_LOCKER: "close",
} as const;
