export type User = {
  id: string;
  email: string;
  name: string;
  registrationNumber: string;
  isVerified: boolean;
};

export type Coordinate = {
  x: number;
  y: number;
};

export type ParkingLot = {
  id: string;
  name: string;
  location: Coordinate;
  address: string;
  capacity: number;
  availableSpaces: number;
};

export type ParkingSpace = {
  id: string;
  parkingLotId: string;
  row: number;
  column: number;
  isAvailable: boolean;
};

export type History = {
  id: string;
  parkingLot: {
    id: string;
    name: string;
    address: string;
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
