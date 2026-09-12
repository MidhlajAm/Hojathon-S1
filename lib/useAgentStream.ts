"use client";

import { useCallback, useRef, useState } from "react";
import type { AgentStep } from "./agent/types";

/**
 * Reads one of the SSE agent routes and turns its frames into React state.
 *
 * Steps appear the moment the agent emits them, which is what makes the
 * timeline honest: it is reporting real progress, not animating a script.
 */

export type StreamState = "idle" | "running" | "done" | "error";

export interface AgentStreamResult<T> {
  steps: AgentStep[];
  state: StreamState;
  result: T | null;
  error: string | null;
  run: (url: string, body: unknown, options?: RunOptions) => Promise<T | null>;
  reset: () => void;
  cancel: () => void;
}

export interface RunOptions {
  /**
   * Keep the steps already on screen and append to them. The report flow runs
   * three agent calls in sequence and shows them as one continuous ticket.
   */
  keepSteps?: boolean;
}

export function useAgentStream<T>(): AgentStreamResult<T> {
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [state, setState] = useState<StreamState>("idle");
  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setSteps([]);
    setState("idle");
    setResult(null);
    setError(null);
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState((current) => (current === "running" ? "idle" : current));
  }, []);

  const run = useCallback(async (
    url: string,
    body: unknown,
    options: RunOptions = {},
  ): Promise<T | null> => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (!options.keepSteps) setSteps([]);
    setResult(null);
    setError(null);
    setState("running");

    let finalResult: T | null = null;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`The agent could not be reached (${response.status}).`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE frames are separated by a blank line.
        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          const frame = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          handleFrame(frame);
          boundary = buffer.indexOf("\n\n");
        }
      }

      setState((current) => (current === "error" ? current : "done"));
    } catch (caught) {
      if (controller.signal.aborted) return null;
      setError(
        caught instanceof Error
          ? caught.message
          : "The agent stopped unexpectedly.",
      );
      setState("error");
    }

    return finalResult;

    function handleFrame(frame: string) {
      let event = "message";
      const dataLines: string[] = [];

      for (const line of frame.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
      }

      if (dataLines.length === 0) return;

      let payload: unknown;
      try {
        payload = JSON.parse(dataLines.join("\n"));
      } catch {
        return;
      }

      if (event === "step") {
        const step = payload as AgentStep;
        setSteps((current) => {
          const index = current.findIndex((existing) => existing.id === step.id);
          if (index === -1) return [...current, step];
          const next = [...current];
          next[index] = step;
          return next;
        });
      } else if (event === "result") {
        finalResult = payload as T;
        setResult(payload as T);
      } else if (event === "error") {
        const { message } = payload as { message: string };
        setError(message);
        setState("error");
      }
    }
  }, []);

  return { steps, state, result, error, run, reset, cancel };
}
