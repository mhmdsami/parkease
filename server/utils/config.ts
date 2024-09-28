import { z } from "zod";

const configSchema = z.object({
  PORT: z.string().default("3000"),
  DATABASE_URL: z
    .string()
    .default("postgres://postgres:postgres@localhost:5432/lockout"),
});

export const { PORT, DATABASE_URL } = configSchema.parse(Bun.env);
