export type User = {
  id: string;
  email: string;
  name: string;
  registrationNumber: string;
};

export type Location = {
  id: string;
  name: string;
  address: string;
};

export type LockerState =
  | "error"
  | "offline"
  | "online"
  | "available"
  | "in_use"
  | null;

export type LockState = "open" | "closed"

export type Locker = {
  id: string;
  row: number;
  column: number;
  lockerState: LockerState;
};

export type History = {
  id: string;
  userId: string;
  location: string;
  startTime: Date;
  endTime: Date | null;
  lockerItem: {
    id: string;
    row: number;
    column: number;
  };
  lockerState: LockerState;
};

export type Key = {
  id: string;
  lockState: LockState
  location: string;
  row: number;
  column: number;
  startTime: Date;
} | null;
