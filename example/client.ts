import { hc } from "hono/client";
import { connectToSSE } from "../src/connectToSseServer.js";
import type { AppType } from "./server.js";

const client = hc<AppType>("http://localhost:1234");
const closeSse = connectToSSE(client.index, {
	onOpen: () => console.log("opened!"),
	onMessage: ({ data }) => console.log(`Got data ${data}`),
	//            ^?
	onError: () => console.log("Got error!"),
});

setTimeout(() => {
	closeSse();
}, 5_000);