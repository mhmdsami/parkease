import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";
import { parkingSpace } from "./parkingSpace";
import { parkingLot } from "./parkingLot";

export const history = pgTable("history", {
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
  endTime: timestamp("end_time"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
