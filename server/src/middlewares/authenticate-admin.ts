import { createMiddleware } from "hono/factory";
import { ADMIN_API_KEY } from "../utils/config";

const authenticateAdmin = createMiddleware(async (c, next) => {
  const token = c.req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return c.json({ success: false, error: "No token provided" }, 401);
  }

  if (token !== ADMIN_API_KEY) {
    return c.json({ success: false, error: "Invalid token" }, 401);
  }

  return next();
});

export default authenticateAdmin;
