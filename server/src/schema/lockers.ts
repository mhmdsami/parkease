import {
  timestamp,
  pgTable,
  text,
  uuid,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const state = pgEnum("locker_state", [
  "online",
  "available",
  "in_use",
  "error",
]);

export const lockers = pgTable("lockers", {
  id: uuid("id").primaryKey().defaultRandom(),
  machineId: text("machine_id").notNull().unique(),
  ipAddr: text("ip_addr").notNull(),
  state: state("state").notNull().default("available"),
  isAlive: boolean("is_alive").notNull().default(true),
  lastPing: timestamp("last_ping").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const LockerSchema = createInsertSchema(lockers, {
  machineId: z
    .string({ message: "Machine ID is a required field" })
    .length(16, { message: "Machine ID must be 16 characters long" }),
  ipAddr: z.string({ message: "IP Address is a required field" }),
  state: z.enum(state.enumValues, { message: "state is a required field" }),
});

export const AddLockerSchema = LockerSchema.pick({
  machineId: true,
  ipAddr: true,
  state: true,
});

export const PingLockerSchemaParam = z.object({
  id: z.string({ message: "Locker ID is a required field" }),
});

export const PingLockerSchemaBody = z.object({
  state: z.enum(state.enumValues, { message: "state is a required field" }),
});
