import type { ClientResponse } from "hono/client";

/**
 * Extract the output type from a client's $get endpoint,
 * but only if the outputFormat is "typed-stream".
 */
type ExtractSSEOutput<C> = C extends {
  $get: (
    ...args: never[]
  ) => Promise<ClientResponse<infer O, infer _S, infer F>>;
}
  ? F extends "typed-stream"
    ? O
    : never
  : never;

/**
 * Extract the $url parameter type from a client.
 * Reused for $path since they accept the same argument shape.
 */
type ExtractUrlArg<C> = C extends {
  $url: (arg?: infer A) => URL;
}
  ? A
  : undefined;

/**
 * Check if a type is an empty object {}, meaning no required keys.
 */
type IsEmptyObject<T> = keyof T extends never ? true : false;

/**
 * Determine whether urlParams should be required.
 * Required only when ExtractUrlArg resolves to a non-empty object
 * (i.e. the route has query or path params).
 */
type UrlParamsRequired<C> = ExtractUrlArg<C> extends undefined
  ? false
  : IsEmptyObject<ExtractUrlArg<C>> extends true
    ? false
    : true;

type SSEArgs<C> = {
  urlParams?: ExtractUrlArg<C>;
  onMessage?: (ev: MessageEvent, data: ExtractSSEOutput<C>) => void;
  onError?: EventListenerOrEventListenerObject;
  onOpen?: (ev: Event) => void;
  onDone?: (ev: MessageEvent) => void;
  withCredentials?: boolean;
};

type SSEArgsRequired<C> = {
  urlParams: ExtractUrlArg<C>;
  onMessage?: (ev: MessageEvent, data: ExtractSSEOutput<C>) => void;
  onError?: EventListenerOrEventListenerObject;
  onOpen?: (ev: Event) => void;
  onDone?: (ev: MessageEvent) => void;
  withCredentials?: boolean;
};

/**
 * A typed SSE client that has a $get endpoint returning a typed-stream,
 * a $url method for type extraction, and a $path method for building
 * relative URL strings.
 */
type TypedSSEClient = {
  $get: (
    ...args: never[]
  ) => Promise<ClientResponse<unknown, number, "typed-stream">>;
  $url: (arg?: never) => URL;
  $path: (arg?: never) => string;
};

export function connectToSSE<C extends TypedSSEClient>(
  client: C,
  ...rest: UrlParamsRequired<C> extends true
    ? [args: SSEArgsRequired<C>]
    : [args?: SSEArgs<C>]
) {
  const args = rest[0];
  const { onError, onMessage, onOpen, onDone, urlParams, withCredentials } =
    args ?? {};
  // Use $path instead of $url to avoid the "Invalid URL" error that occurs
  // when hc is created with a relative base like "/". $path returns a relative
  // path string (e.g. "/map/api?filters=...") which EventSource resolves
  // against the current page origin.
  const path = client.$path(urlParams as never);
  const eventsource = new EventSource(path, {
    withCredentials,
  });
  if (onMessage !== undefined)
    eventsource.addEventListener("message", (ev: MessageEvent) => {
      const data: ExtractSSEOutput<C> = JSON.parse(ev.data);
      onMessage(ev, data);
    });
  eventsource.addEventListener("done", (ev) => {
    eventsource.close();
    if (onDone !== undefined) onDone(ev);
  });
  if (onError !== undefined) eventsource.addEventListener("error", onError);
  if (onOpen !== undefined) eventsource.addEventListener("open", onOpen);
  return eventsource;
}
