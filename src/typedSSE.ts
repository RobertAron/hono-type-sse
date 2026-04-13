import type { Context, TypedResponse } from "hono";
import {
  type SSEMessage,
  type SSEStreamingApi,
  streamSSE,
} from "hono/streaming";

interface SSEMessageTyped<T> {
  data: T;
  event?: string;
  id?: string;
  retry?: number;
}

class SSEStreamingApiTyped<T> {
  constructor(public stream: SSEStreamingApi) {}

  async writeSSE(message: SSEMessageTyped<T>) {
    // casting to allow replacing this single property in the object. Avoid making more garbage.
    (message as SSEMessage).data = JSON.stringify(message.data);
    await this.stream.writeSSE(message as SSEMessage);
  }

  async done() {
    await this.stream.writeSSE({ event: "done", data: "" });
  }
}

export const streamSSETyped = <T>(
  c: Context,
  cb: (stream: SSEStreamingApiTyped<T>) => Promise<void>,
  onError?: (e: Error, stream: SSEStreamingApiTyped<T>) => Promise<void>,
): Response & TypedResponse<T, 200, "typed-stream"> => {
  return streamSSE(
    c,
    async (stream) => {
      await cb(new SSEStreamingApiTyped<T>(stream));
    },
    onError
      ? async (e, stream) => {
          await onError(e, new SSEStreamingApiTyped<T>(stream));
        }
      : undefined,
  ) as Response & TypedResponse<T, 200, "typed-stream">;
};
