import { Hono } from "hono";
import { PORT } from "./utils/config";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import * as router from "./routes";

const app = new Hono().basePath("/api");

app.use(logger());
app.use(cors());

app.get("/", (c) => {
  return c.json({ message: "Lockout API" });
});

app.get("/healthcheck", (c) => {
  return c.json({ status: "ok", uptime: process.uptime() });
});

app.route("/user", router.userRouter);
app.route("/locker", router.lockerRouter);
app.route("/location", router.locationRouter);
app.notFound((c) => c.json({ success: false, message: "Not Found" }, 404));

export default {
  port: PORT,
  fetch: app.fetch,
};
