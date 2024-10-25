import * as cron from "node-cron";
import { ADMIN_API_KEY } from "./config";

cron.schedule("30 * * * *", () =>
  fetch("http://localhost:3000/api/locker/sync", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ADMIN_API_KEY}`,
    },
  })
);
