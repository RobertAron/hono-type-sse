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

connectToSSE(client.sse, {
  onOpen: () => addMessage("Connection opened", true),
  onMessage: (_, data) => {
    addMessage(`Received: myType = ${data.myType}`);
  },
  onDone: () => addMessage("Stream complete", true),
  onError: () => addMessage("Connection error", true),
});
