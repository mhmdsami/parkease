import { Hono } from "hono";
import authenticateUser from "../middlewares/authenticate-user";
import {
  UserSchema,
  SignInUserSchema,
  users,
  UpdateUserSchema,
  otp,
  VerifyUserSchema,
} from "../schema/users";
import { history } from "../schema/history";
import { db } from "../utils/db";
import { sign } from "hono/jwt";
import { JWT_SECRET, VERIFY_EMAIL } from "../utils/config";
import { desc, eq, and, or, isNull } from "drizzle-orm";
import validator from "../middlewares/validator";
import { sendEmail } from "../utils/mailer";
import EmailVerification from "../templates/email-verification";
import { parkingSpace } from "../schema/parkingSpace";
import { parkingLot } from "../schema/parkingLot";

const user = new Hono();

user.post("/create", validator("json", UserSchema), async (c) => {
  const user = c.req.valid("json");

  const doesUserExist = await db
    .select()
    .from(users)
    .where(
      or(
        eq(users.email, user.email),
        eq(users.registrationNumber, user.registrationNumber)
      )
    );

  if (doesUserExist.length > 0) {
    return c.json({ success: false, error: "User already exists" }, 409);
  }

  const [createdUser] = await db
    .insert(users)
    .values({
      ...user,
      password: Bun.password.hashSync(user.password),
      isVerified: VERIFY_EMAIL,
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

  if (!createdUser.isVerified) {
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
  }

  const token = await sign(
    {
      email: createdUser.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
    },
    JWT_SECRET
  );

  return c.json(
    {
      success: true,
      message: "Successfully created user",
      data: {
        user: createdUser,
        token,
      },
    },
    201
  );
});

user.post(
  "/verify",
  authenticateUser,
  validator("json", VerifyUserSchema),
  async (c) => {
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
  }
);

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
      429
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

user.get("/current", authenticateUser, async (c) => {
  const { email } = c.get("jwtPayload");

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    return c.json({ success: false, error: "User not found" }, 404);
  }

  const [historyEntry] = await db
    .select({
      id: history.id,
      parkingLot: {
        id: parkingLot.id,
        name: parkingLot.name,
        address: parkingLot.address,
      },
      parkingSpace: {
        id: parkingSpace.id,
        row: parkingSpace.row,
        column: parkingSpace.column,
        isAvailable: parkingSpace.isAvailable,
      },
      startTime: history.startTime,
      endTime: history.endTime,
    })
    .from(history)
    .where(and(eq(history.userId, user.id), isNull(history.endTime)))
    .leftJoin(parkingSpace, eq(history.parkingSpaceId, parkingSpace.id))
    .leftJoin(parkingLot, eq(parkingSpace.parkingLotId, parkingLot.id));

  return c.json({ success: true, data: { current: historyEntry } });
});

user.get("/history", authenticateUser, async (c) => {
  const { email } = c.get("jwtPayload");

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    return c.json({ success: false, error: "User not found" }, 404);
  }

  const userHistory = await db
    .select({
      id: history.id,
      parkingLot: {
        id: parkingLot.id,
        name: parkingLot.name,
        address: parkingLot.address,
      },
      parkingSpace: {
        id: parkingSpace.id,
        row: parkingSpace.row,
        column: parkingSpace.column,
        isAvailable: parkingSpace.isAvailable,
      },
      startTime: history.startTime,
      endTime: history.endTime,
    })
    .from(history)
    .where(eq(history.userId, user.id))
    .leftJoin(parkingSpace, eq(history.parkingSpaceId, parkingSpace.id))
    .leftJoin(parkingLot, eq(parkingSpace.parkingLotId, parkingLot.id))
    .orderBy(desc(history.startTime));

  return c.json({ success: true, data: { history: userHistory } });
});

export default user;
