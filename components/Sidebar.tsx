"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AgentIcon,
  CalendarIcon,
  HomeIcon,
  ListIcon,
  MapIcon,
  PlusIcon,
  UserIcon,
} from "./icons";

const PRIMARY = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/map", label: "Map", Icon: MapIcon },
  { href: "/my-issues", label: "My issues", Icon: ListIcon },
  { href: "/events", label: "Events", Icon: CalendarIcon },
] as const;

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col gap-6 py-8 md:flex">
      <Link href="/" className="flex items-baseline gap-1.5">
        <span className="text-xl font-bold tracking-tight-display">Civic</span>
        <span className="text-xl font-normal tracking-tight-display text-muted">
          Connect
        </span>
      </Link>

      <nav className="flex flex-col gap-0.5">
        {PRIMARY.map(({ href, label, Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[15px] transition-colors ${
                active
                  ? "bg-white font-semibold text-ink shadow-[0_1px_2px_rgba(22,34,46,0.06)]"
                  : "font-medium text-muted hover:bg-white/60 hover:text-ink"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/report"
        className="flex items-center justify-center gap-2 rounded-lg bg-action px-4 py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-action-ink"
      >
        <PlusIcon className="h-5 w-5" />
        Report an issue
      </Link>

      {/* The agent lives on the dark surface wherever it appears. */}
      <Link
        href="/agent"
        className="on-agent flex items-center gap-3 rounded-lg bg-agent px-3 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-agent-deep"
      >
        <AgentIcon className="h-5 w-5 text-marking" />
        Civic Agent
      </Link>

      <div className="mt-auto">
        <Link
          href="/profile"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[15px] transition-colors ${
            pathname.startsWith("/profile")
              ? "bg-white font-semibold text-ink"
              : "font-medium text-muted hover:bg-white/60 hover:text-ink"
          }`}
        >
          <UserIcon className="h-5 w-5" />
          Profile
        </Link>
      </div>
    </aside>
  );
}
