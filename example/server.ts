import { Hono } from "hono";
import { streamSSETyped } from "../src/typedSSE.js";
import index from "./index.html";

const app = new Hono().get("/sse", (c) =>
  streamSSETyped<{ myType: number }>(c, async (s) => {
    for (let i = 0; i < 5; i++) {
      s.writeSSE({
        data: { myType: i },
      });
      await s.stream.sleep(1000);
    }
    await s.done();
  })
);

export type AppType = typeof app;

Bun.serve({
  routes: {
    "/": index,
  },
  fetch: app.fetch,
});

console.log("serving!");
