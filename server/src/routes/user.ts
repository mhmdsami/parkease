import { Hono } from "hono";
import authenticateUser from "../middlewares/authenticate-user";
import {
  UserSchema,
  SignInUserSchema,
  users,
  UpdateUserSchema,
  otp,
  VerifyUserSchema
} from "../schema/users";
import { db } from "../utils/db";
import { history } from "../schema/history";
import { sign } from "hono/jwt";
import { JWT_SECRET } from "../utils/config";
import { desc, eq, isNull, and } from "drizzle-orm";
import validator from "../middlewares/validator";
import { lockerItem, locations } from "../schema/locations";
import { lockers } from "../schema/lockers";
import { sendEmail } from "../utils/mailer";
import EmailVerification from "../templates/email-verification";

const user = new Hono();

user.post("/create", validator("json", UserSchema), async (c) => {
  const user = c.req.valid("json");

  const [createdUser] = await db
    .insert(users)
    .values({
      ...user,
      password: Bun.password.hashSync(user.password),
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      registrationNumber: users.registrationNumber,
      isVerified: users.isVerified,
    });

  if (!createdUser) {
    return c.json({ success: false, error: "Failed to create user" }, 500);
  }

  const [createdOtp] = await db
    .insert(otp)
    .values({
      email: createdUser.email,
      otp: Math.floor(100000 + Math.random() * 900000).toString(),
    })
    .returning({
      otp: otp.otp,
    });

  if (!createdOtp) {
    return c.json({ success: false, error: "Failed to create OTP" }, 500);
  }

  if (
    !(await sendEmail(
      EmailVerification,
      {
        otp: createdOtp.otp,
        name: createdUser.name,
      },
      createdUser.email,
      "Verify your email"
    ))
  ) {
    return c.json({ success: false, error: "Failed to send email" }, 500);
  }

  const token = await sign(
    {
      email: createdUser.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
    },
    JWT_SECRET
  );

  return c.json({
    success: true,
    message: "Successfully created user",
    data: {
      user: createdUser,
      token,
    },
  });
});

user.post("/verify", authenticateUser, validator("json", VerifyUserSchema), async (c) => {
  const { email } = c.get("jwtPayload");
  const { otp: otpFromUser } = c.req.valid("json");

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    return c.json({ success: false, error: "User not found" }, 404);
  }

  const [otpData] = await db
    .select()
    .from(otp)
    .where(and(eq(otp.email, email), eq(otp.otp, otpFromUser)))
    .orderBy(desc(otp.createdAt));

  if (!otpData) {
    return c.json({ success: false, error: "Invalid OTP" }, 401);
  }

  if (new Date().getTime() - otpData.createdAt.getTime() > 1000 * 60 * 5) {
    return c.json({ success: false, error: "OTP expired" }, 401);
  }

  await db.delete(otp).where(eq(otp.email, email));
  await db
    .update(users)
    .set({ isVerified: true })
    .where(eq(users.email, email));

  return c.json({ success: true, message: "Successfully verified email" });
});

user.post("/resend-otp", authenticateUser, async (c) => {
  const { email } = c.get("jwtPayload");

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    return c.json({ success: false, error: "User not found" }, 404);
  }

  const [otpData] = await db
    .select()
    .from(otp)
    .where(eq(otp.email, email))
    .orderBy(desc(otp.createdAt));

  if (
    otpData &&
    new Date().getTime() - otpData.createdAt.getTime() < 1000 * 60
  ) {
    return c.json(
      { success: false, error: "Please wait before resending OTP" },
      400
    );
  }

  const [createdOtp] = await db
    .insert(otp)
    .values({
      email,
      otp: Math.floor(100000 + Math.random() * 900000).toString(),
    })
    .returning({
      otp: otp.otp,
    });

  if (!createdOtp) {
    return c.json({ success: false, error: "Failed to create OTP" }, 500);
  }

  if (
    !(await sendEmail(
      EmailVerification,
      {
        otp: createdOtp.otp,
        name: user.name,
      },
      email,
      "Verify your email"
    ))
  ) {
    return c.json({ success: false, error: "Failed to send email" }, 500);
  }

  return c.json({ success: true, message: "OTP sent" });
});

user.post("/sign-in", validator("json", SignInUserSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      registrationNumber: users.registrationNumber,
      password: users.password,
      isVerified: users.isVerified,
    })
    .from(users)
    .where(eq(users.email, email));

  if (!user) {
    return c.json({ success: false, error: "User not found" }, 404);
  }

  const { password: passwordFromDb, ...details } = user;

  if (!Bun.password.verifySync(password, passwordFromDb)) {
    return c.json({ success: false, error: "Invalid password" }, 401);
  }

  const token = await sign(
    {
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
    },
    JWT_SECRET
  );

  return c.json({
    success: true,
    message: "Successfully signed in",
    data: {
      user: details,
      token,
    },
  });
});

user.get("/me", authenticateUser, async (c) => {
  const { email } = c.get("jwtPayload");

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      registrationNumber: users.registrationNumber,
      isVerified: users.isVerified,
    })
    .from(users)
    .where(eq(users.email, email));

  if (!user) {
    return c.json({ success: false, error: "User not found" }, 404);
  }

  return c.json({ success: true, data: { user } });
});

user.patch(
  "/",
  authenticateUser,
  validator("json", UpdateUserSchema),
  async (c) => {
    const { email } = c.get("jwtPayload");
    const user = c.req.valid("json");

    const [updatedUser] = await db
      .update(users)
      .set(user)
      .where(eq(users.email, email))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        registrationNumber: users.registrationNumber,
      });

    if (!updatedUser) {
      return c.json({ success: false, error: "Failed to update user" }, 500);
    }

    return c.json({
      success: true,
      message: "Successfully updated user",
      data: { user: updatedUser },
    });
  }
);

user.get("/history", authenticateUser, async (c) => {
  const { email } = c.get("jwtPayload");

  const [user] = await db
    .select({
      id: users.id,
    })
    .from(users)
    .where(eq(users.email, email));

  if (!user) {
    return c.json({ success: false, error: "User not found" }, 404);
  }

  const userHistory = await db
    .select({
      id: history.id,
      userId: history.userId,
      startTime: history.startTime,
      endTime: history.endTime,
      location: locations.name,
      lockerItem: {
        id: lockerItem.id,
        row: lockerItem.row,
        column: lockerItem.column,
      },
      lockerState: lockers.state,
    })
    .from(history)
    .where(eq(history.userId, user.id))
    .leftJoin(lockerItem, eq(history.lockerItemId, lockerItem.id))
    .leftJoin(lockers, eq(lockerItem.lockerId, lockers.id))
    .leftJoin(locations, eq(lockerItem.locationId, locations.id))
    .orderBy(desc(history.startTime));

  return c.json({ success: true, data: { history: userHistory } });
});

user.get("/key", authenticateUser, async (c) => {
  const { email } = c.get("jwtPayload");

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    return c.json({ success: false, error: "User not found" }, 404);
  }

  if (!user.currentLockerId) {
    return c.json(
      { success: true, message: "Key fetched", data: { locker: null } },
      200
    );
  }

  const [currentLocker] = await db
    .select()
    .from(lockers)
    .where(eq(lockers.id, user.currentLockerId));

  if (!currentLocker) {
    return c.json({ success: false, error: "Locker not found" }, 404);
  }

  const [currentLockerItem] = await db
    .select({
      id: lockerItem.id,
      location: locations.name,
      row: lockerItem.row,
      column: lockerItem.column,
    })
    .from(lockerItem)
    .where(eq(lockerItem.lockerId, currentLocker.id))
    .leftJoin(locations, eq(lockerItem.locationId, locations.id));

  if (!currentLockerItem) {
    return c.json({ success: false, error: "Locker item not found" }, 404);
  }

  const [currentHistory] = await db
    .select()
    .from(history)
    .where(
      and(
        eq(history.userId, user.id),
        eq(history.lockerItemId, currentLockerItem.id),
        isNull(history.endTime)
      )
    );

  return c.json({
    success: true,
    data: {
      locker: {
        ...currentLockerItem,
        lockState: currentLocker.lockState,
        startTime: currentHistory.startTime,
      },
    },
  });
});

export default user;
