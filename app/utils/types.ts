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
  name: string;
  location: string;
  row: number;
  column: number;
  isAvailable: boolean;
};

export type History = {
  id: string;
  userId: string;
  parkingLotId: string;
  location: string;
  startTime: Date;
  endTime: Date | null;
  space: {
    id: string;
    row: number;
    column: number
  }
};
