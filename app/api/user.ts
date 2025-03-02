import { API, ApiResponse } from "./config";
import { History, User } from "@/utils/types";

export const signInApi = async (credentials: {
  email: string;
  password: string;
}) => {
  const res = await fetch(
    API.BASE_URL + API.ENDPOINTS.USER.BASE_URL() + API.ENDPOINTS.USER.SIGN_IN(),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to sign in");
  }

  const data = (await res.json()) as ApiResponse<{ token: string; user: User }>;
  if (!data.success) {
    throw new Error(data.error);
  }

  return data.data;
};

export const registerApi = async (details: {
  name: string;
  email: string;
  password: string;
  registrationNumber: string;
}) => {
  const res = await fetch(
    API.BASE_URL +
      API.ENDPOINTS.USER.BASE_URL() +
      API.ENDPOINTS.USER.REGISTER(),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(details),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to register");
  }

  const data = (await res.json()) as ApiResponse<{ token: string; user: User }>;
  if (!data.success) {
    throw new Error(data.error);
  }

  return data.data;
};

export const verifyOtpApi = async (token: string, otp: string) => {
  const res = await fetch(
    API.BASE_URL + API.ENDPOINTS.USER.BASE_URL() + API.ENDPOINTS.USER.VERIFY(),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ otp }),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to verify OTP");
  }

  const data = (await res.json()) as ApiResponse<never>;
  if (!data.success) {
    throw new Error(data.error);
  }

  return true;
};

export const resendOtpApi = async (token: string) => {
  const res = await fetch(
    API.BASE_URL +
      API.ENDPOINTS.USER.BASE_URL() +
      API.ENDPOINTS.USER.RESEND_OTP(),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to resend OTP");
  }

  const data = (await res.json()) as ApiResponse<never>;
  if (!data.success) {
    throw new Error(data.error);
  }

  return true;
};

export const getUserInfoApi = async (token: string) => {
  const res = await fetch(
    API.BASE_URL + API.ENDPOINTS.USER.BASE_URL() + API.ENDPOINTS.USER.INFO(),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to sign in");
  }

  const data = (await res.json()) as ApiResponse<{ user: User }>;
  if (!data.success) {
    throw new Error(data.error);
  }

  return data.data;
};

export const getCurrentReservationApi = async(token: string) => {
  const res = await fetch(
    API.BASE_URL + API.ENDPOINTS.USER.BASE_URL() + API.ENDPOINTS.USER.CURRENT_RESERVATION(),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch history");
  }

  const data = (await res.json()) as ApiResponse<{ current: History }>;
  if (!data.success) {
    throw new Error(data.error);
  }

  return data.data.current;
}

export const getUserHistoryApi = async (token: string) => {
  const res = await fetch(
    API.BASE_URL + API.ENDPOINTS.USER.BASE_URL() + API.ENDPOINTS.USER.HISTORY(),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch history");
  }

  const data = (await res.json()) as ApiResponse<{ history: History[] }>;
  if (!data.success) {
    throw new Error(data.error);
  }

  return data.data.history;
};
