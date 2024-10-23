import { zValidator } from "@hono/zod-validator";
import { ValidationTargets } from "hono";
import { ZodSchema } from "zod";

const validator = <T extends ZodSchema>(
  target: keyof ValidationTargets,
  schema: T
) =>
  zValidator(target, schema, (res, c) => {
    if (!res.success) {
      return c.json(
        { success: false, error: res.error.issues[0].message },
        400
      );
    }
  });

export default validator;
