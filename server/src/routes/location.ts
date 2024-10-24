import { Hono } from "hono";
import { db } from "../utils/db";
import {
  AddLocationSchema,
  AddLockerItemBodySchema,
  AddLockerItemParamSchema,
  ConnectLockerItemBodySchema,
  ConnectLockerItemParamSchema,
  DisassociateLockerItemSchema,
  GetLockerItemsSchema,
  locations,
  lockerItem,
} from "../schema/locations";
import authenticateAdmin from "../middlewares/authenticate-admin";
import { asc, eq } from "drizzle-orm";
import validator from "../middlewares/validator";
import { lockers } from "../schema/lockers";

const location = new Hono();

location.get("/", async (c) => {
  const availableLocations = await db.select().from(locations);

  return c.json({
    success: true,
    message: "Successfully fetched locations",
    data: {
      locations: availableLocations,
    },
  });
});

location.post(
  "/",
  authenticateAdmin,
  validator("json", AddLocationSchema),
  async (c) => {
    const { name, address } = c.req.valid("json");

    const [createdLocation] = await db
      .insert(locations)
      .values({
        name,
        address,
      })
      .returning({
        id: locations.id,
        name: locations.name,
        address: locations.address,
      });

    if (!createdLocation) {
      return c.json(
        {
          success: false,
          error: "Failed to create location",
        },
        500
      );
    }

    return c.json({
      success: true,
      message: "Successfully created location",
      data: {
        location: createdLocation,
      },
    });
  }
);

location.post(
  "/:id/locker",
  authenticateAdmin,
  validator("param", AddLockerItemParamSchema),
  validator("json", AddLockerItemBodySchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const { row, column } = c.req.valid("json");

    const [location] = await db
      .select()
      .from(locations)
      .where(eq(locations.id, id));

    if (!location) {
      return c.json(
        {
          success: false,
          error: "Location not found",
        },
        404
      );
    }

    try {
      const [createdLockerItem] = await db
        .insert(lockerItem)
        .values({
          locationId: id,
          row,
          column,
        })
        .returning({
          id: lockerItem.id,
          row: lockerItem.row,
          column: lockerItem.column,
        })
        .onConflictDoNothing();

      if (!createdLockerItem) {
        return c.json(
          {
            success: false,
            error: "Locker item already exists",
          },
          400
        );
      }

      return c.json({
        success: true,
        message: "Successfully created locker item",
        data: {
          lockerItem: createdLockerItem,
        },
      });
    } catch (e) {
      return c.json(
        {
          success: false,
          error: "Failed to create locker item",
        },
        500
      );
    }
  }
);

location.get("/:id", validator("param", GetLockerItemsSchema), async (c) => {
  const { id } = c.req.valid("param");

  const [location] = await db
    .select()
    .from(locations)
    .where(eq(locations.id, id));

  if (!location) {
    return c.json(
      {
        success: false,
        error: "Location not found",
      },
      404
    );
  }

  const availableLockers = await db
    .select({
      id: lockerItem.id,
      row: lockerItem.row,
      column: lockerItem.column,
      locker: {
        id: lockers.id,
        state: lockers.state,
      },
    })
    .from(lockerItem)
    .where(eq(lockerItem.locationId, id))
    .leftJoin(lockers, eq(lockerItem.lockerId, lockers.id))
    .leftJoin(locations, eq(lockerItem.locationId, locations.id))
    .orderBy(lockerItem.row, lockerItem.column);

  return c.json({
    success: true,
    message: "Successfully fetched location",
    data: {
      locationId: location.id,
      lockers: availableLockers,
    },
  });
});

location.post(
  "/:lockerItemId/associate",
  authenticateAdmin,
  validator("param", ConnectLockerItemParamSchema),
  validator("json", ConnectLockerItemBodySchema),
  async (c) => {
    const { lockerItemId } = c.req.valid("param");
    const { lockerId } = c.req.valid("json");

    const [selectedLockerItem] = await db
      .select()
      .from(lockerItem)
      .where(eq(lockerItem.id, lockerItemId));

    if (!selectedLockerItem) {
      return c.json(
        {
          success: false,
          error: "Locker item not found",
        },
        404
      );
    }

    if (selectedLockerItem.lockerId) {
      return c.json(
        {
          success: false,
          error: "Locker item already connected",
        },
        400
      );
    }

    const [isLockerAlreadyConnected] = await db
      .select()
      .from(lockerItem)
      .where(eq(lockerItem.lockerId, lockerId));

    if (isLockerAlreadyConnected) {
      return c.json(
        {
          success: false,
          error: "Locker is already associated with another locker item",
        },
        400
      );
    }

    const [updatedLockerItem] = await db
      .update(lockerItem)
      .set({
        lockerId,
      })
      .where(eq(lockerItem.id, lockerItemId))
      .returning({
        id: lockerItem.id,
        row: lockerItem.row,
        column: lockerItem.column,
        lockerId: lockerItem.lockerId,
      });

    return c.json({
      success: true,
      message: "Successfully connected locker item",
      data: {
        lockerItem: updatedLockerItem,
      },
    });
  }
);

location.post(
  "/:lockerItemId/disassociate",
  authenticateAdmin,
  validator("param", DisassociateLockerItemSchema),
  async (c) => {
    const { lockerItemId } = c.req.valid("param");

    const [selectedLockerItem] = await db
      .select()
      .from(lockerItem)
      .where(eq(lockerItem.id, lockerItemId));

    if (!selectedLockerItem) {
      return c.json(
        {
          success: false,
          error: "Locker item not found",
        },
        404
      );
    }

    if (!selectedLockerItem.lockerId) {
      return c.json(
        {
          success: false,
          error: "Locker item is not connected",
        },
        400
      );
    }

    const [updatedLockerItem] = await db
      .update(lockerItem)
      .set({
        lockerId: null,
      })
      .where(eq(lockerItem.id, lockerItemId))
      .returning({
        id: lockerItem.id,
        row: lockerItem.row,
        column: lockerItem.column,
        lockerId: lockerItem.lockerId,
      });

    return c.json({
      success: true,
      message: "Successfully disconnected locker item",
      data: {
        lockerItem: updatedLockerItem,
      },
    });
  }
);

export default location;
