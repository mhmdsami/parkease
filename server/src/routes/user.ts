import { Hono } from "hono";
import authenticateUser from "../middlewares/authenticate-user";
import { zValidator } from "@hono/zod-validator";
import { CreateUserSchema, users } from "../schema/users";
import { db } from "../utils/db";
import { sign } from "hono/jwt";
import { JWT_SECRET } from "../utils/config";
import { eq } from "drizzle-orm";

const user = new Hono();

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

user.post(
  "/create",
  zValidator("json", CreateUserSchema, (res, c) => {
    if (!res.success) {
      return c.json(
        { success: false, error: res.error.issues[0].message },
        400
      );
    }
  }),
  async (c) => {
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
  }
);

export default user;
