import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  point,
} from "drizzle-orm/pg-core";
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";

export const parkingLot = pgTable("parking_lot", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  capacity: integer("capacity").notNull().default(0),
  location: point("location", { mode: "xy" })
    .notNull()
    .default(sql`point(0, 0)`),
  createdAt: timestamp("created_at").defaultNow(),
});

export const AddParkingLotSchema = createInsertSchema(parkingLot, {
  name: z.string({ message: "Name is a required field" }),
  address: z.string({ message: "Address is a required field" }),
  location: z.object({
    x: z.number({ message: "X coordinate is a required field" }),
    y: z.number({ message: "Y coordinate is a required field" }),
  }),
});

export const UpdateParkingLotParamSchema = z.object({
  parkingLotId: z.string({ message: "Parking Lot ID is a required field" }),
});

export const UpdateParkingLotBodySchema = z
  .object({
    name: z.string({ message: "Name is a required field" }),
    address: z.string({ message: "Address is a required field" }),
    location: z.object({
      x: z.number({ message: "X coordinate is a required field" }),
      y: z.number({ message: "Y coordinate is a required field" }),
    }),
  })
  .partial()
  .refine(
    (data) =>
      data.name !== undefined ||
      data.address !== undefined ||
      data.location !== undefined,
    {
      message: "At least one field is required to update",
    }
  );

export const DeleteParkingLotParamSchema = z.object({
  parkingLotId: z.string({ message: "Parking Lot ID is a required field" }),
});
