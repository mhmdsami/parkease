import { Hono } from "hono";
import validator from "../middlewares/validator";
import {
  AccquireLockerSchema,
  AddLockerSchema,
  lockers,
  PingLockerBodySchema,
  PingLockerParamSchema,
} from "../schema/lockers";
import { db } from "../utils/db";
import { and, eq } from "drizzle-orm";
import authenticateAdmin from "../middlewares/authenticate-admin";
import authenticateUser from "../middlewares/authenticate-user";
import { users } from "../schema/users";

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
  validator("param", PingLockerParamSchema),
  validator("json", PingLockerBodySchema),
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

locker.post(
  "/accquire/:id",
  authenticateUser,
  validator("param", AccquireLockerSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const { email } = c.get("jwtPayload");

    const [locker] = await db
      .select({
        id: lockers.id,
        ipAddr: lockers.ipAddr,
        state: lockers.state,
      })
      .from(lockers)
      .where(eq(lockers.id, id));

    if (!locker) {
      return c.json({ success: false, error: "Locker not found" }, 404);
    }

    if (locker.state != "available" || !locker.ipAddr) {
      return c.json({ success: false, error: "Locker is not available" }, 400);
    }

    const [user] = await db
      .select({
        id: users.id,
        currentLockerId: users.currentLockerId,
      })
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      return c.json({ success: false, error: "User not found" }, 404);
    }

    if (user.currentLockerId) {
      return c.json({ sucess: false, error: "User already has a locker" }, 400);
    }

    try {
      await db.transaction(async (tx) => {
        await tx
          .update(lockers)
          .set({
            state: "in_use",
          })
          .where(eq(lockers.id, id))
          .returning({
            id: lockers.id,
            state: lockers.state,
          });
        await tx
          .update(users)
          .set({
            currentLockerId: id,
          })
          .where(eq(users.email, email));

        const res = (await (
          await fetch(`http://${locker.ipAddr}/accquire`, {
            method: "POST",
          })
        ).json()) as ApiResponse<never>;

        if (!res.success) {
          return c.json({ success: false, error: res.message }, 400);
        }
      });

      return c.json({
        success: true,
        message: "Successfully accquired locker",
      });
    } catch (e) {
      return c.json(
        { success: false, error: "Failed to accquire locker" },
        500
      );
    }
  }
);

locker.post("/open", authenticateUser, async (c) => {
  const { email } = c.get("jwtPayload");

  const [user] = await db
    .select({
      id: users.id,
      currentLockerId: users.currentLockerId,
    })
    .from(users)
    .where(eq(users.email, email));

  if (!user) {
    return c.json({ success: false, error: "User not found" }, 404);
  }

  if (!user.currentLockerId) {
    return c.json(
      { success: false, error: "User does not have a locker" },
      400
    );
  }

  const [locker] = await db
    .select({
      id: lockers.id,
      ipAddr: lockers.ipAddr,
    })
    .from(lockers)
    .where(eq(lockers.id, user.currentLockerId));

  if (!locker) {
    return c.json({ success: false, error: "Locker not found" }, 404);
  }

  try {
    const res = (await (
      await fetch(`http://${locker.ipAddr}/open`, {
        method: "POST",
      })
    ).json()) as ApiResponse<never>;

    if (!res.success) {
      return c.json({ success: false, error: res.message }, 400);
    }

    return c.json({
      success: true,
      message: "Successfully opened locker",
    });
  } catch (e) {
    return c.json({ success: false, error: "Failed to open locker" }, 500);
  }
});

locker.post("/close", authenticateUser, async (c) => {
  const { email } = c.get("jwtPayload");

  const [user] = await db
    .select({
      id: users.id,
      currentLockerId: users.currentLockerId,
    })
    .from(users)
    .where(eq(users.email, email));

  if (!user) {
    return c.json({ success: false, error: "User not found" }, 404);
  }

  if (!user.currentLockerId) {
    return c.json(
      { success: false, error: "User does not have a locker" },
      400
    );
  }

  const [locker] = await db
    .select({
      id: lockers.id,
      ipAddr: lockers.ipAddr,
    })
    .from(lockers)
    .where(eq(lockers.id, user.currentLockerId));

  if (!locker) {
    return c.json({ success: false, error: "Locker not found" }, 404);
  }

  try {
    const res = (await (
      await fetch(`http://${locker.ipAddr}/close`, {
        method: "POST",
      })
    ).json()) as ApiResponse<never>;

    if (!res.success) {
      return c.json({ success: false, error: res.message }, 400);
    }

    return c.json({
      success: true,
      message: "Successfully closed locker",
    });
  } catch (e) {
    return c.json({ success: false, error: "Failed to close locker" }, 500);
  }
});

locker.post("/release", authenticateUser, async (c) => {
  const { email } = c.get("jwtPayload");

  const [user] = await db
    .select({
      id: users.id,
      currentLockerId: users.currentLockerId,
    })
    .from(users)
    .where(eq(users.email, email));

  if (!user) {
    return c.json({ success: false, error: "User not found" }, 404);
  }

  if (!user.currentLockerId) {
    return c.json(
      { success: false, error: "User does not have a locker" },
      400
    );
  }

  const [locker] = await db
    .select({
      id: lockers.id,
      ipAddr: lockers.ipAddr,
    })
    .from(lockers)
    .where(eq(lockers.id, user.currentLockerId));

  if (!locker) {
    return c.json({ success: false, error: "Locker not found" }, 404);
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(lockers)
        .set({
          state: "available",
        })
        .where(eq(lockers.id, locker.id));
      await tx
        .update(users)
        .set({
          currentLockerId: null,
        })
        .where(eq(users.email, email));

      const res = (await (
        await fetch(`http://${locker.ipAddr}/release`, {
          method: "POST",
        })
      ).json()) as ApiResponse<never>;

      if (!res.success) {
        return c.json({ success: false, error: res.message }, 400);
      }
    });

    return c.json({
      success: true,
      message: "Successfully released locker",
    });
  } catch (e) {
    return c.json({ success: false, error: "Failed to release locker" }, 500);
  }
});

export default locker;
