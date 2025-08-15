import { hc } from "hono/client";
import { connectToSSE } from "../src/connectToSseNode.js";
import type { AppType } from "./server.js";

const client = hc<AppType>("http://localhost:1234");
const sse = connectToSSE(client.index, {
  onOpen: () => console.log("opened!"),
  onMessage: (_, data) => console.log(`Got data ${data}`),
  onError: () => {
    sse.close();
    return console.log("Got error!");
  },
});
