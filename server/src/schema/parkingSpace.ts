import {
  pgTable,
  uuid,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { parkingLot } from "./parkingLot";

export const parkingSpace = pgTable("parking_space", {
  id: uuid("id").primaryKey().defaultRandom(),
  parkingLotId: uuid("parking_lot_id")
    .notNull()
    .references(() => parkingLot.id),
  row: integer("row").notNull(),
  column: integer("column").notNull(),
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});
