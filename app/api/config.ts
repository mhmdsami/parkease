export const API = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || "",
  ENDPOINTS: {
    USER: {
      BASE_URL: () => "/user",
      REGISTER: () => "/create",
      SIGN_IN: () => "/sign-in",
      INFO: () => "/me",
      KEY: () => "/key",
      HISTORY: () => "/history",
      VERIFY: () => "/verify",
      RESEND_OTP: () => "/resend-otp",
    },
    LOCATION: {
      BASE_URL: () => "/location",
      ALL: () => "/all",
      PARKING_LOT: (id: string) => `/${id}`,
      PARKING_LOT_LAYOUT: (id: string) => `/${id}/spaces`,
    },
    PARKING_SPACE: {
      BASE_URL: () => "/space",
      RESERVE: (id: string) => `/${id}/reserve`,
      END: (id: string) => `/${id}/end`,
    }
  },
};

export type ApiResponse<T> =
  | { success: false; error: string }
  | { success: true; message: string; data: T };
