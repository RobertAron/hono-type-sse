import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { streamSSETyped } from "../src/typedSSE.js";
import index from "./index.html";

const app = new Hono()
  .get("/sse", (c) =>
    streamSSETyped<{ myType: number }>(c, async (s) => {
      for (let i = 0; i < 5; i++) {
        s.writeSSE({
          data: { myType: i },
        });
        await s.stream.sleep(1000);
      }
      await s.done();
    }),
  )
  .get(
    "/sse-query",
    zValidator(
      "query",
      z.object({
        count: z.coerce.number().int().positive(),
        prefix: z.string().optional(),
      }),
    ),
    (c) => {
      const { count, prefix = "item" } = c.req.valid("query");
      return streamSSETyped<{ label: string; index: number }>(c, async (s) => {
        for (let i = 0; i < count; i++) {
          s.writeSSE({
            data: { label: `${prefix}-${i}`, index: i },
          });
          await s.stream.sleep(1000);
        }
        await s.done();
      });
    },
  );

export type AppType = typeof app;

Bun.serve({
  port: 3000,
  routes: {
    "/": index,
  },
  fetch: app.fetch,
});

console.log("serving! http://localhost:3000");
