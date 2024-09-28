export const API = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || "",
  ENDPOINTS: {
    USER: {
      BASE_URL: () => "/user",
      SIGN_IN: () => "/sign-in",
      INFO: () => "/me"
    },
  },
};

export type ApiResponse<T> =
  | { success: false; error: string }
  | { success: true; message: string; data: T };
