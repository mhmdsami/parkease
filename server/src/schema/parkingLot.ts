import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";

export const parkingLot = pgTable("parking_lot", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  location: text("location").notNull(),
  capacity: integer("capacity").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const AddParkingLotSchema = createInsertSchema(parkingLot, {
  name: z.string({ message: "Name is a required field" }),
  location: z.string({ message: "Location is a required field" }),
});

export const UpdateParkingLotParamSchema = z.object({
  parkingLotId: z.string({ message: "Parking Lot ID is a required field" }),
});

export const UpdateParkingLotBodySchema = z.object({
  id: z.string({ message: "Parking Lot ID is a required field" }),
  name: z.string({ message: "Name is a required field" }),
  location: z.string({ message: "Location is a required field" }),
});

export const DeleteParkingLotParamSchema = z.object({
  parkingLotId: z.string({ message: "Parking Lot ID is a required field" }),
});
