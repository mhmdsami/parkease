import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { lockerItem } from "./locations";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const history = pgTable("history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  lockerItemId: uuid("locker_id")
    .notNull()
    .references(() => lockerItem.id),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
});

export const AddHistorySchema = createInsertSchema(history, {
  userId: z.string({ message: "User ID is a required field" }),
  lockerItemId: z.string({ message: "Locker ID is a required field" }),
});

export const UpdateHistorySchema = z.object({
  id: z.string({ message: "History ID is a required field" }),
  endTime: z.string({ message: "End Time is a required field" }),
});
