import { API, ApiResponse } from "./config";

export const accquireLockerApi = async (token: string, id: string) => {
  const res = await fetch(
    API.BASE_URL +
      API.ENDPOINTS.LOCKER.BASE_URL() +
      API.ENDPOINTS.LOCKER.ACCQUIRE(id),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to accquire locker");
  }

  const data = (await res.json()) as ApiResponse<never>;
  if (!data.success) {
    throw new Error(data.error);
  }

  return true;
};

export const releaseLockerApi = async (token: string) => {
  const res = await fetch(
    API.BASE_URL +
      API.ENDPOINTS.LOCKER.BASE_URL() +
      API.ENDPOINTS.LOCKER.RELEASE(),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to release locker");
  }

  const data = (await res.json()) as ApiResponse<never>;
  if (!data.success) {
    throw new Error(data.error);
  }

  return true;
};
