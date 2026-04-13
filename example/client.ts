import { hc } from "hono/client";
import { connectToSSE } from "../src/connectToSse.js";
import type { AppType } from "./server.js";

const client = hc<AppType>("http://localhost:3000");

// Simple route — no params required
const sse = connectToSSE(client.sse, {
  onOpen: () => console.log("opened!"),
  onMessage: (_, data) => console.log(`Got data ${data.myType}`),
  onError: () => {
    sse.close();
    return console.log("Got error!");
  },
});

// Route with query params — urlParams is required
const sseQuery = connectToSSE(client["sse-query"], {
  urlParams: { query: { count: "5" } },
  onOpen: () => console.log("opened query!"),
  onMessage: (_, data) => console.log(`Got data ${data.label} ${data.index}`),
  onError: () => {
    sseQuery.close();
    return console.log("Got error!");
  },
});
