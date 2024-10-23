import { Hono } from "hono";
import authenticateUser from "../middlewares/authenticate-user";
import {
  UserSchema,
  SignInUserSchema,
  users,
  UpdateUserSchema,
} from "../schema/users";
import { db } from "../utils/db";
import { sign } from "hono/jwt";
import { JWT_SECRET } from "../utils/config";
import { eq } from "drizzle-orm";
import validator from "../middlewares/validator";

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
    });

  if (!createdUser) {
    return c.json({ success: false, error: "Failed to create user" }, 500);
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

user.post("/sign-in", validator("json", SignInUserSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      registrationNumber: users.registrationNumber,
      password: users.password,
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

export default user;
