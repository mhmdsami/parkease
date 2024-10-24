import { API, ApiResponse } from "./config";
import { Locker, Location } from "@/utils/types";

export const getAllLocationsApi = async () => {
  const res = await fetch(
    API.BASE_URL +
      API.ENDPOINTS.LOCATION.BASE_URL() +
      API.ENDPOINTS.LOCATION.ALL()
  );

  if (!res.ok) {
    throw new Error("Failed to fetch locations");
  }

  const data = (await res.json()) as ApiResponse<{ locations: Location[] }>;
  if (!data.success) {
    throw new Error(data.error);
  }

  return data.data.locations;
};

export const getLockersApi = async (id: string) => {
  const res = await fetch(
    API.BASE_URL +
      API.ENDPOINTS.LOCATION.BASE_URL() +
      API.ENDPOINTS.LOCATION.LOCKERS(id)
  );

  if (!res.ok) {
    throw new Error("Failed to fetch lockers");
  }

  const data = (await res.json()) as ApiResponse<{
    locationId: string;
    name: string;
    lockers: Locker[];
  }>;
  if (!data.success) {
    throw new Error(data.error);
  }

  return data.data;
};
