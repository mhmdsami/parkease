import { API, ApiResponse } from "./config";
import { History, Key, User } from "@/utils/types";

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

export const getKeyApi = async (token: string) => {
  const res = await fetch(
    API.BASE_URL + API.ENDPOINTS.USER.BASE_URL() + API.ENDPOINTS.USER.KEY(),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch key");
  }

  const data = (await res.json()) as ApiResponse<{ locker: Key }>;
  if (!data.success) {
    throw new Error(data.error);
  }

  return data.data.locker;
};
