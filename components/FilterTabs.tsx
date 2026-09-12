import Link from "next/link";
import type { Route } from "next";

export interface FilterOption {
  value: string;
  label: string;
}

/**
 * Filters are links, not buttons — each view is addressable, so a shared link
 * lands on the same list the sender was looking at.
 */
export default function FilterTabs({
  basePath,
  param = "filter",
  options,
  active,
}: {
  basePath: string;
  param?: string;
  options: readonly FilterOption[];
  active: string;
}) {
  return (
    <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      {options.map((option) => {
        const selected = option.value === active;
        const href = `${basePath}?${param}=${option.value}` as Route;
        return (
          <Link
            key={option.value}
            href={href}
            aria-current={selected ? "true" : undefined}
            className={`shrink-0 rounded-chip px-3 py-1.5 text-sm transition-colors ${
              selected
                ? "bg-ink font-semibold text-white"
                : "font-medium text-muted hover:bg-white hover:text-ink"
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </nav>
  );
}
