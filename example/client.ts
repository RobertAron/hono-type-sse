import { hc } from "hono/client";
import { connectToSSE } from "../src/connectToSse.js";
import type { AppType } from "./server.js";

const client = hc<AppType>("http://localhost:3000");
const sse = connectToSSE(client.sse, {
  onOpen: () => console.log("opened!"),
  onMessage: (_, data) => console.log(`Got data ${data}`),
  onError: () => {
    sse.close();
    return console.log("Got error!");
  },
});
