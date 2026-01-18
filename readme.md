# Hono Typed SSE

## Getting Started

```shell
npm install @robertaron/hono-typed-sse
```

### Server

```ts
import { Hono } from "hono";
import { streamSSETyped } from "@robertaron/hono-typed-sse/typedSSE";

const app = new Hono().get("/sse", (c) =>
  streamSSETyped<{ myType: number }>(c, async (s) => {
    for (let i = 0; i < 5; i++) {
      s.writeSSE({
        data: { myType: i },
      });
      await s.stream.sleep(1000);
    }
    // done sends a custom event. This can be used to close the stream, and let the EventSource know it shouldn't try to re-connect.
    await s.done();
  })
);

export type AppType = typeof app;
```

### Client

```ts
import { hc } from "hono/client";
import { connectToSSE } from "@robertaron/hono-typed-sse/connectToSse";
import type { AppType } from "./server";

const client = hc<AppType>("http://localhost:3000");

connectToSSE(client.sse, {
  onOpen: () => console.log("opened!"),
  onMessage: (_, data) => console.log(`Got data: ${data.myType}`),
  onDone: () => console.log("stream complete"),
  onError: () => console.log("connection error"),
});
```

The client uses `EventSource` which is only available in browser environments. Testing the client from Node/Bun is not supported.

## Motivation

This package aims to unlock the power of SSE and Hono with minimal overhead.

Hono has a great RPC system, but it doesn't work for server-sent events. It's unlikely there will be first-party support in the near future due to [package size concerns](https://github.com/honojs/hono/pull/3957#issuecomment-2693310852).
