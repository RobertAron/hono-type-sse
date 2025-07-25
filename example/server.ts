import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { streamSSETyped } from "../src/typedSSE.js";

const app = new Hono().get("/", (c) =>
  streamSSETyped<{ myType: number }>(c, async (s) => {
    for (let i = 0; i < 5; i++) {
      s.writeSSE({
        data: { myType: 1 },
      });
      await s.sleep(1000);
    }
  }),
);

export type AppType = typeof app;

serve({ fetch: app.fetch, port: 1234 });
console.log("serving!");
