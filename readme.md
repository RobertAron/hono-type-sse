# Hono Typed SSE

## Getting Started

```shell
npm install @robertaron/hono-typed-sse
```

```ts
// Server
import {streamSSETyped} from "@robertaron/hono-typed-sse/typedSSE";
const app = new Hono().get("/", 
  (c) => streamSSETyped<{ myType: number; }>(c, async (s) => {
  for (let i = 0; i < 5; i++) {
    s.writeSSE({
      data: { myType: 1 },
    });
    await s.sleep(1000);
  }
}));
// Client
import {connectToSSE} from "@robertaron/hono-typed-sse/connectToSse";
const client = hc<AppType>("http://localhost:1234");
const closeSse = connectToSSE(client.index, {
  onOpen: () => console.log("opened!"),
  onMessage: ({ data }) => console.log(`Got data ${data}`),
  onError: () => console.log("Got error!"),
});

setTimeout(() => {
  closeSse();
}, 5_000);
```

## Node Compatibility

NodeJS _does not_ have `EventSource` available. In order for this library to work with node, you can use the import which adapts to the [eventsource](https://www.npmjs.com/package/eventsource) npm package.
```ts
import {connectToSSE} from "@robertaron/hono-typed-sse/connectToSseNode";
```

## Motivation

This package aims to unlock the power of SSE and hono with minimal overhead. 


Hono has an extremely powerful RPC system, but it doesn't work for server side events. It's unlikely there will be 1st party support in the near future due to [package size concerns](https://github.com/honojs/hono/pull/3957#issuecomment-2693310852).
