import { createMiddleware } from "hono/factory";
import { ADMIN_API_KEY } from "../utils/config";

const authenticateAdmin = createMiddleware(async (c, next) => {
  const token = c.req.header("x-api-key");

  if (!token) {
    return c.json({ success: false, error: "You are not authorized to perform this" }, 401);
  }

  if (token !== ADMIN_API_KEY) {
    return c.json({ success: false, error: "Invalid token" }, 403);
  }

  return next();
});

export default authenticateAdmin;
