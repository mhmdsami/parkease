import { API, ApiResponse } from "./config";
import { ParkingSpace, ParkingLot } from "@/utils/types";

export const getAllParkingLots = async () => {
  const res = await fetch(
    API.BASE_URL +
      API.ENDPOINTS.LOCATION.BASE_URL() +
      API.ENDPOINTS.LOCATION.ALL()
  );

  if (!res.ok) {
    throw new Error("Failed to fetch all parking lots");
  }

  const data = (await res.json()) as ApiResponse<{ parkingLots: ParkingLot[] }>;
  if (!data.success) {
    throw new Error(data.error);
  }

  return data.data.parkingLots;
};

export const getParkingLotLayout = async (id: string) => {
  const res = await fetch(
    API.BASE_URL +
      API.ENDPOINTS.LOCATION.BASE_URL() +
      API.ENDPOINTS.LOCATION.PARKING_LOT_LAYOUT(id)
  );

  if (!res.ok) {
    throw new Error("Failed to fetch parking layout");
  }

  const data = (await res.json()) as ApiResponse<{
    parkingLot: ParkingLot;
    spaces: ParkingSpace[];
  }>;
  if (!data.success) {
    throw new Error(data.error);
  }

  return data.data;
};
