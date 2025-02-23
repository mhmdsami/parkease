import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { parkingSpace } from "./parkingSpace";
import { parkingLot } from "./parkingLot";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const historyTable = pgTable("history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  parkingSpaceId: uuid("parking_space_id")
    .notNull()
    .references(() => parkingSpace.id),
  parkingLotId: uuid("parking_lot_id")
    .notNull()
    .references(() => parkingLot.id),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const AddHistorySchema = createInsertSchema(historyTable, {
  userId: z.string({ message: "User ID is a required field" }),
  parkingSpaceId: z.string({ message: "Parking Space ID is a required field" }),
  parkingLotId: z.string({ message: "Parking Lot ID is a required field" }),
});

export const UpdateHistorySchema = z.object({
  id: z.string({ message: "History ID is a required field" }),
  endTime: z.string({ message: "End Time is a required field" }),
});
