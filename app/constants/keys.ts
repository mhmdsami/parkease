export const STORAGE_KEYS = {
  TOKEN: "__parkease_token",
} as const;

export const QUERY_KEYS = {
  REGISTER: "register",
  SIGN_IN: "sign-in",
  VERIFY_OTP: "verify-otp",
  RESEND_OTP: "resend-otp",
  ME: "me",
  HISTORY: "history",

  PARKING_LOT: "parking-lot",
  PARKING_LOTS: "parking-lots",

  CURRENT_RESERVATION: "current-reservation",
  RESERVE_SPACE: "reserve-space",
  END_RESERVATION: "end-reservation",
} as const;
