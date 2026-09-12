"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AgentIcon, CloseIcon } from "./icons";

const ACTIONS = [
  { href: "/report", label: "Report an issue", hint: "Photo in, complaint out" },
  { href: "/my-issues", label: "Track my complaints", hint: "Status of everything you filed" },
  { href: "/map", label: "Find issues near me", hint: "What is open around you" },
  { href: "/events", label: "Find civic events", hint: "Clean-ups and grievance camps" },
] as const;

/**
 * §15 — the agent is reachable from anywhere. It opens onto the things the
 * agent can actually do, rather than a blank chat box that implies it only talks.
 */
export default function AgentDock() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // The workspace is the agent's home; a floating duplicate there is noise.
  if (pathname.startsWith("/agent") || pathname.startsWith("/report")) return null;

  return (
    <div className="fixed bottom-20 right-4 z-40 md:bottom-6 md:right-6">
      {open ? (
        <div className="on-agent mb-3 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-card bg-agent text-white shadow-[0_12px_32px_rgba(22,34,46,0.28)]">
          <header className="flex items-center justify-between border-b border-agent-rule px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-semibold">
              <span className="h-2 w-2 rounded-full bg-marking" />
              Civic Agent
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-agent-muted hover:text-white"
            >
              <CloseIcon className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </button>
          </header>

          <p className="px-4 pt-4 text-[15px] leading-6">
            What would you like done?
          </p>

          <ul className="px-2 pb-2 pt-2">
            {ACTIONS.map((action) => (
              <li key={action.href}>
                <Link
                  href={action.href}
                  onClick={close}
                  className="block rounded-lg px-2 py-2 hover:bg-white/5"
                >
                  <span className="block text-[15px] font-medium">
                    {action.label}
                  </span>
                  <span className="block text-[13px] text-agent-muted">
                    {action.hint}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="border-t border-agent-rule px-4 py-3">
            <Link
              href="/agent"
              onClick={close}
              className="text-sm font-semibold text-marking hover:underline"
            >
              Open the full workspace
            </Link>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-agent text-marking shadow-[0_6px_20px_rgba(22,34,46,0.32)] hover:bg-agent-deep"
      >
        <AgentIcon className="h-6 w-6" />
        <span className="sr-only">
          {open ? "Close the agent" : "Open the agent"}
        </span>
      </button>
    </div>
  );
}
