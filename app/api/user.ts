import { API, ApiResponse } from "./config";

type User = {
  id: string;
  email: string;
  name: string;
  registrationNumber: string;
};

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

export const getUserInfo = async (token: string) => {
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
