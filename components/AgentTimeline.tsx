import type { AgentStep } from "@/lib/agent/types";
import { AlertIcon, CheckIcon } from "./icons";

/**
 * The works ticket.
 *
 * This is the product's one bold element and the only place road-marking yellow
 * appears. Steps land as the stream emits them, so the motion is reporting real
 * progress rather than decorating the wait. Everything around it stays quiet.
 */

function Marker({ status }: { status: AgentStep["status"] }) {
  if (status === "done") {
    return (
      <span className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full bg-marking text-agent">
        <CheckIcon className="h-3 w-3" strokeWidth={3} />
      </span>
    );
  }

  if (status === "failed") {
    return (
      <span className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full bg-sev-high text-white">
        <AlertIcon className="h-3 w-3" strokeWidth={2.5} />
      </span>
    );
  }

  if (status === "active") {
    return (
      <span className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 border-marking bg-agent">
        <span className="animate-pulse-ring h-2 w-2 rounded-full bg-marking" />
      </span>
    );
  }

  return (
    <span className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 border-agent-rule bg-agent" />
  );
}

export default function AgentTimeline({
  steps,
  goal,
  className = "",
}: {
  steps: AgentStep[];
  goal?: string;
  className?: string;
}) {
  return (
    <section
      className={`on-agent rounded-card bg-agent p-5 text-white sm:p-6 ${className}`}
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-marking" />
        <h2 className="text-sm font-semibold tracking-tight-display">
          Civic Agent
        </h2>
      </div>

      {goal ? (
        <p className="mt-3 border-l-2 border-marking pl-3 text-[15px] leading-6 text-white">
          {goal}
        </p>
      ) : null}

      {steps.length === 0 ? (
        <p className="mt-4 text-sm text-agent-muted">Waiting to start.</p>
      ) : (
        <ol className="relative mt-5 space-y-4">
          {/* The rail. Square ends — this is a ticket, not a card. */}
          <span
            className="absolute left-[9px] top-2 bottom-2 w-px bg-agent-rule"
            aria-hidden="true"
          />
          {steps.map((step) => (
            <li
              key={step.id}
              className="animate-step-land relative flex gap-3"
              data-status={step.status}
            >
              <Marker status={step.status} />
              <div className="min-w-0 flex-1 -mt-0.5">
                <p
                  className={`text-sm leading-6 ${
                    step.status === "pending"
                      ? "text-agent-muted"
                      : step.status === "failed"
                        ? "font-medium text-[#ff9b9b]"
                        : "font-medium text-white"
                  }`}
                >
                  {step.label}
                </p>
                {step.detail ? (
                  <p className="text-[13px] leading-5 text-agent-muted">
                    {step.detail}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
