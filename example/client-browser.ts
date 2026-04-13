import { hc } from "hono/client";
import { connectToSSE } from "../src/connectToSse.js";
import type { AppType } from "./server.js";

const messages = document.getElementById("messages")!;

function addMessage(text: string, isStatus = false) {
  const div = document.createElement("div");
  div.className = isStatus ? "message status" : "message";
  div.textContent = text;
  messages.appendChild(div);
}

const client = hc<AppType>(window.location.origin);

connectToSSE(client["sse-query"], {
  urlParams: { query: { count: "5", prefix:"a-prefix" } },
  onOpen: () => addMessage("Connection opened", true),
  onMessage: (_, data) => {
    addMessage(`Received: myType = ${data.index} ${data.label}`);
  },
  onDone: () => addMessage("Stream complete", true),
  onError: () => addMessage("Connection error", true),
});
