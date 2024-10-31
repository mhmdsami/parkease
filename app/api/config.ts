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
      LOCKERS: (id: string) => `/${id}`,
    },
    LOCKER: {
      BASE_URL: () => "/locker",
      ACCQUIRE: (id: string) => `/accquire/${id}`,
      RELEASE: () => "/release",
      OPEN: () => "/open",
      CLOSE: () => "/close",
    },
  },
};

export type ApiResponse<T> =
  | { success: false; error: string }
  | { success: true; message: string; data: T };
