import { timestamp, pgTable, text, uuid, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  registrationNumber: text("registration_number").notNull().unique(),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const otp = pgTable("otp", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  otp: text("otp").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const UserSchema = createInsertSchema(users, {
  name: z
    .string({ message: "Name is a required field " })
    .min(3, { message: "Name must be at least 3 characters" }),
  email: z
    .string({ message: "Email is a required field " })
    .email("Must be a valid email")
    .includes("srmist.edu.in", {
      message: "Email must be a SRMIST email",
    }),
  password: z.string({ message: "Password is a required field " }).min(8, {
    message: "Password must be at least 8 characters",
  }),
  registrationNumber: z
    .string({ message: "Registration number is a required field " })
    .includes("RA", {
      message: "Registration number must include 'RA'",
    })
    .length(15, { message: "Registration number must be 15 characters" }),
});

export const VerifyUserSchema = z.object({
  otp: z.string({ message: "OTP is a required field " }).length(6, {
    message: "OTP must be 6 characters",
  }),
});

export const SignInUserSchema = UserSchema.pick({
  email: true,
  password: true,
});

export const UpdateUserSchema = UserSchema.pick({
  name: true,
  password: true,
}).partial().refine(data => data.name !== undefined || data.password !== undefined, {
  message: "At least one of 'name' or 'password' must be provided",
});
