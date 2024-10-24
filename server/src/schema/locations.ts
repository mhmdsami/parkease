import {
  timestamp,
  pgTable,
  text,
  uuid,
  integer,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { lockers } from "./lockers";

export const locations = pgTable("locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const lockerItem = pgTable(
  "locker_item",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    lockerId: uuid("locker_id")
      .unique()
      .references(() => lockers.id),
    locationId: uuid("location_id")
      .notNull()
      .references(() => locations.id),
    row: integer("row").notNull(),
    column: integer("column").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    ak: unique().on(table.locationId, table.row, table.column),
  })
);

export const AddLocationSchema = createInsertSchema(locations, {
  name: z.string({ message: "Name is a required field" }),
  address: z.string({ message: "Address is a required field" }),
});

export const AddLockerItemParamSchema = z.object({
  id: z.string({ message: "Location ID is a required field" }),
});

export const AddLockerItemBodySchema = z.object({
  row: z.number({ message: "Row is a required field" }),
  column: z.number({ message: "Column is a required field" }),
});

export const GetLockerItemsSchema = z.object({
  id: z.string({ message: "Location ID is a required field" }),
});

export const ConnectLockerItemParamSchema = z.object({
  lockerItemId: z.string({ message: "Locker Item ID is a required field" }),
});

export const ConnectLockerItemBodySchema = z.object({
  lockerId: z.string({ message: "Locker ID is a required field" }),
});

export const DisassociateLockerItemSchema = z.object({
  lockerItemId: z.string({ message: "Locker Item ID is a required field" }),
});
