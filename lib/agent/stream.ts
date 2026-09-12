import type { AgentStep, Emit } from "./types";

/**
 * Server-sent-event plumbing for the agent routes.
 *
 * `agentStream` hands your callback an `emit` that puts a `step` frame on the
 * wire the instant an agent calls it, then finishes with one `result` frame —
 * or an `error` frame if the agent throws. Route Handlers are uncached by
 * default in Next 16, so nothing extra is needed to keep the stream live.
 */
export function agentStream<T>(
  run: (emit: Emit, signal: AbortSignal) => Promise<T>,
  signal?: AbortSignal,
): Response {
  const encoder = new TextEncoder();
  const controller = new AbortController();

  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(ctrl) {
      let closed = false;

      const send = (event: string, data: unknown) => {
        if (closed) return;
        ctrl.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      const emit: Emit = (step: AgentStep) => send("step", step);

      try {
        const result = await run(emit, controller.signal);
        send("result", result);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "The agent stopped unexpectedly.";
        // Surface the failure on the timeline as well as on the error channel,
        // so a thrown agent shows up as a failed step rather than a blank screen.
        send("step", {
          id: "agent-error",
          label: "Agent stopped",
          status: "failed",
          detail: message,
        } satisfies AgentStep);
        send("error", { message });
      } finally {
        closed = true;
        ctrl.close();
      }
    },
    cancel() {
      controller.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

/** Small helper the mock agents use to pace their steps convincingly. */
export function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new Error("aborted"));
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new Error("aborted"));
      },
      { once: true },
    );
  });
}
