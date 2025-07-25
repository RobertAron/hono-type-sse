// Base code:
// https://github.com/honojs/hono/blob/main/src/helper/streaming/sse.ts
// Minor changes in this file to do with adding generics + JSON.stringify
import { StreamingApi } from "hono/utils/stream";
import { HtmlEscapedCallbackPhase, resolveCallback } from "hono/utils/html";
import type { Context, TypedResponse } from "hono";

interface SSEMessageTypedError {
  data: string;
  event: "error";
  id?: string;
  retry?: number;
}
type SSEMessageTyped<T> =
  | {
      data: T;
      event?: string;
      id?: string;
      retry?: number;
    }
  | SSEMessageTypedError;

export class SSEStreamingApi<T> extends StreamingApi {
  async writeSSE(message: SSEMessageTyped<T>) {
    const data = await resolveCallback(
      JSON.stringify(message.data),
      HtmlEscapedCallbackPhase.Stringify,
      false,
      {},
    );
    const dataLines = (data as string)
      .split("\n")
      .map((line) => {
        return `data: ${line}`;
      })
      .join("\n");

    const sseData =
      [
        message.event && `event: ${message.event}`,
        dataLines,
        message.id && `id: ${message.id}`,
        message.retry && `retry: ${message.retry}`,
      ]
        .filter(Boolean)
        .join("\n") + "\n\n";

    await this.write(sseData);
  }
}

const run = async <T>(
  stream: SSEStreamingApi<T>,
  cb: (stream: SSEStreamingApi<T>) => Promise<void>,
  onError?: (e: Error, stream: SSEStreamingApi<T>) => Promise<void>,
): Promise<void> => {
  try {
    await cb(stream);
  } catch (e) {
    if (e instanceof Error && onError) {
      await onError(e, stream);

      await stream.writeSSE({
        event: "error",
        data: e.message,
      });
    } else {
      console.error(e);
    }
  } finally {
    stream.close();
  }
};

const contextStash: WeakMap<ReadableStream, Context> = new WeakMap<
  ReadableStream,
  Context
>();

export const streamSSETyped = <T>(
  c: Context,
  cb: (stream: SSEStreamingApi<T>) => Promise<void>,
  onError?: (e: Error, stream: SSEStreamingApi<T>) => Promise<void>,
): Response & TypedResponse<T, 200, "typed-stream"> => {
  const { readable, writable } = new TransformStream();
  const stream = new SSEStreamingApi(writable, readable);
  // in bun, `c` is destroyed when the request is returned, so hold it until the end of streaming
  contextStash.set(stream.responseReadable, c);
  c.header("Transfer-Encoding", "chunked");
  c.header("Content-Type", "text/event-stream");
  c.header("Cache-Control", "no-cache");
  c.header("Connection", "keep-alive");

  run(stream, cb, onError);

  return c.newResponse(stream.responseReadable) as Response &
    TypedResponse<T, 200, "typed-stream">;
};
