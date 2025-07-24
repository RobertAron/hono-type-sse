import { type ErrorEvent, EventSource } from "eventsource";
import type { ClientRequest } from "hono/client";

type OptionalIfUndefined<T> = {
	[K in keyof T as undefined extends T[K] ? K : never]?: T[K];
} & {
	[K in keyof T as undefined extends T[K] ? never : K]: T[K];
};

export function connectToSSE<T, U>(
	client: ClientRequest<{
		$get: {
			input: U;
			output: T;
			outputFormat: "typed-stream";
			status: 200;
		};
	}>,
	args?: {
		params?: Parameters<(typeof client)["$url"]>[0];
		onMessage?: (ev: MessageEvent<T>) => void;
		onError?: (ev: ErrorEvent) => void;
		onOpen?: (ev: Event) => void;
		withCredentials?: boolean;
	} & OptionalIfUndefined<{ params: Parameters<(typeof client)["$url"]>[0] }>,
) {
	const { onError, onMessage, onOpen, params, withCredentials } = args ?? {};
	const eventsource = new EventSource(client.$url(params), { withCredentials });
	if (onMessage !== undefined)
		eventsource.addEventListener("message", onMessage);
	if (onError !== undefined) eventsource.addEventListener("error", onError);
	if (onOpen !== undefined) eventsource.addEventListener("open", onOpen);
	return () => eventsource.close();
}
