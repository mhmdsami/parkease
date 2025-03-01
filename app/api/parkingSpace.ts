import { ParkingSpace } from "@/utils/types";
import { API, ApiResponse } from "./config";

export const reserveParkingSpace = async (token: string, id: string) => {
  const res = await fetch(
    API.BASE_URL +
      API.ENDPOINTS.PARKING_SPACE.BASE_URL() +
      API.ENDPOINTS.PARKING_SPACE.RESERVE(id),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to reserve parking space");
  }

  const data = (await res.json()) as ApiResponse<ParkingSpace>;
  if (!data.success) {
    throw new Error(data.error);
  }

  return data.data;
};

export const endParkingSpaceReservation = async (token: string, id: string) => {
  const res = await fetch(
    API.BASE_URL +
      API.ENDPOINTS.PARKING_SPACE.BASE_URL() +
      API.ENDPOINTS.PARKING_SPACE.END(id),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to end parking space reservation");
  }

  const data = (await res.json()) as ApiResponse<ParkingSpace>;
  if (!data.success) {
    throw new Error(data.error);
  }

  return data.data;
};
