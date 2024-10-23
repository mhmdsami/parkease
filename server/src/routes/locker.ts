import { Hono } from "hono";
import validator from "../middlewares/validator";
import {
  AddLockerSchema,
  lockers,
  PingLockerSchemaBody,
  PingLockerSchemaParam,
} from "../schema/lockers";
import { db } from "../utils/db";
import { and, eq } from "drizzle-orm";
import authenticateAdmin from "../middlewares/authenticate-admin";

const locker = new Hono();

locker.post("/online", validator("json", AddLockerSchema), async (c) => {
  const { state, ...locker } = c.req.valid("json");

  if (state !== "online") {
    return c.json(
      {
        success: false,
        error: "Locker state must be 'online'",
      },
      400
    );
  }

  const [createdLocker] = await db
    .insert(lockers)
    .values({
      state: "available",
      ...locker,
    })
    .onConflictDoUpdate({
      target: lockers.machineId,
      set: {
        state: "available",
        isAlive: true,
        lastPing: new Date(),
      },
    })
    .returning({
      id: lockers.id,
      state: lockers.state,
    });

  if (!createdLocker) {
    return c.json({ success: false, error: "Failed to create locker" }, 500);
  }

  return c.json({
    success: true,
    message: "Successfully created locker",
    data: {
      locker: createdLocker,
    },
  });
});

locker.get("/all", authenticateAdmin, async (c) => {
  const availableLockers = await db
    .select({
      id: lockers.id,
      machineId: lockers.machineId,
      state: lockers.state,
      lastPing: lockers.lastPing,
    })
    .from(lockers)
    .where(and(eq(lockers.state, "available"), eq(lockers.isAlive, true)));

  return c.json({
    success: true,
    message: "Successfully fetched available lockers",
    data: {
      lockers: availableLockers,
    },
  });
});

locker.post(
  "/ping/:id",
  validator("param", PingLockerSchemaParam),
  validator("json", PingLockerSchemaBody),
  async (c) => {
    const { id } = c.req.valid("param");
    const { state } = c.req.valid("json");

    const [updatedLocker] = await db
      .update(lockers)
      .set({
        state,
        lastPing: new Date(),
      })
      .where(eq(lockers.id, id))
      .returning({
        id: lockers.id,
        state: lockers.state,
        lastPing: lockers.lastPing,
      });

    if (!updatedLocker) {
      return c.json({ success: false, error: "Locker not found" }, 404);
    }

    return c.json({
      success: true,
      message: "Successfully updated locker",
      data: {
        locker: updatedLocker,
      },
    });
  }
);

export default locker;
