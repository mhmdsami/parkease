import { Hono } from "hono";
import { PORT } from "../utils/config";

const app = new Hono().basePath("/api");

app.get("/", (c) => {
  return c.json({ message: "Lockout API" });
});

app.get("/healthcheck", (c) => {
  return c.json({ status: "ok", uptime: process.uptime() });
});

export default {
  port: PORT,
  app,
};
