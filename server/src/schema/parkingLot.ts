import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

export const parkingLot = pgTable("parking_lot", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  location: text("location").notNull(),
  capacity: integer("capacity").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
