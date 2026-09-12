"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AgentIcon, HomeIcon, MapIcon, PlusIcon, UserIcon } from "./icons";

const TABS = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/map", label: "Map", Icon: MapIcon },
] as const;

const TAIL = [
  { href: "/agent", label: "Agent", Icon: AgentIcon },
  { href: "/profile", label: "Profile", Icon: UserIcon },
] as const;

function Tab({
  href,
  label,
  Icon,
  active,
}: {
  href: Route;
  label: string;
  Icon: typeof HomeIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium ${
        active ? "text-ink" : "text-muted"
      }`}
    >
      <Icon className="h-6 w-6" />
      {label}
    </Link>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-surface/95 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-lg items-center px-2 pb-[env(safe-area-inset-bottom)]">
        {TABS.map((tab) => (
          <Tab key={tab.href} {...tab} active={isActive(tab.href)} />
        ))}

        {/* Reporting is the product's reason to exist, so it sits raised in the
            centre rather than reading as one tab among five. */}
        <Link
          href="/report"
          className="-mt-6 flex flex-1 flex-col items-center gap-1"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-action text-white shadow-[0_4px_12px_rgba(11,95,208,0.35)]">
            <PlusIcon className="h-6 w-6" />
          </span>
          <span className="text-[11px] font-semibold text-ink">Report</span>
        </Link>

        {TAIL.map((tab) => (
          <Tab key={tab.href} {...tab} active={isActive(tab.href)} />
        ))}
      </div>
    </nav>
  );
}
