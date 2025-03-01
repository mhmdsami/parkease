import { createMiddleware } from "hono/factory";
import { JWT_SECRET } from "../utils/config";
import { verify, JwtVariables } from "hono/jwt";

const authenticateUser = createMiddleware<{
  Variables: JwtVariables<{ email: string; iat: number; exp: number }>;
}>(async (c, next) => {
  const token = c.req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return c.json({ success: false, error: "No token provided" }, 401);
  }

  try {
    const jwtPayload = await verify(token, JWT_SECRET);

    if (
      !jwtPayload ||
      !jwtPayload.email ||
      !jwtPayload.iat ||
      !jwtPayload.exp
    ) {
      return c.json({ success: false, error: "Invalid token" }, 403);
    }

    if (jwtPayload.exp < Date.now() / 1000) {
      return c.json({ success: false, error: "Token expired" }, 401);
    }

    c.set("jwtPayload", jwtPayload);
  } catch (err) {
    return c.json({ success: false, error: "Invalid token" }, 403);
  }

  return next();
});

export default authenticateUser;
