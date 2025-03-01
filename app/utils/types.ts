export type User = {
  id: string;
  email: string;
  name: string;
  registrationNumber: string;
  isVerified: boolean;
};

export type ParkingLot = {
  id: string;
  name: string;
  location: string;
  capacity: number;
};

export type ParkingSpace = {
  id: string;
  row: number;
  column: number;
  isAvailable: boolean;
};

export type History = {
  id: string;
  parkingLot: {
    id: string;
    name: string;
    location: string;
  };
  parkingSpace: {
    id: string;
    row: number;
    column: number;
    isAvailable: boolean;
  };
  startTime: string;
  endTime: string;
};
