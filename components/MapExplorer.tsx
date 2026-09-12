"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useState } from "react";
import { DEFAULT_CENTER, distanceKm, formatDistance } from "@/lib/geo";
import type { Issue } from "@/lib/types";
import SeverityBadge from "./SeverityBadge";
import StatusBadge from "./StatusBadge";

// Leaflet reads `window` when the module loads, so it must stay out of the
// server render entirely.
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-[52vh] min-h-[320px] w-full animate-pulse rounded-card border border-rule bg-[#dfe5ea]" />
  ),
});

export default function MapExplorer({
  issues,
  initialSelectedId,
}: {
  issues: Issue[];
  initialSelectedId?: string;
}) {
  const [selectedId, setSelectedId] = useState<string | undefined>(
    initialSelectedId,
  );

  const select = useCallback((id: string) => setSelectedId(id), []);

  const ranked = [...issues].sort(
    (a, b) =>
      distanceKm(DEFAULT_CENTER, a.location) -
      distanceKm(DEFAULT_CENTER, b.location),
  );

  return (
    <div className="space-y-5">
      <MapView issues={issues} selectedId={selectedId} onSelect={select} />

      <section>
        <h2 className="text-lg font-semibold tracking-tight-display">
          Nearby issues
        </h2>

        <ul className="mt-3 overflow-hidden rounded-card border border-rule bg-surface">
          {ranked.map((issue, index) => {
            const selected = issue.id === selectedId;
            return (
              <li
                key={issue.id}
                className={index > 0 ? "border-t border-rule" : ""}
              >
                <div
                  className={`flex items-start gap-3 px-4 py-3 ${
                    selected ? "bg-ground" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => select(issue.id)}
                    className="min-w-0 flex-1 text-left"
                    aria-pressed={selected}
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-medium">
                        {issue.analysis.title}
                      </span>
                      <SeverityBadge severity={issue.analysis.severity} />
                    </span>
                    <span className="mt-0.5 block text-sm text-muted">
                      {issue.location.label} ·{" "}
                      {formatDistance(distanceKm(DEFAULT_CENTER, issue.location))}{" "}
                      away
                    </span>
                    {issue.complaintStatus ? (
                      <span className="mt-1.5 block">
                        <StatusBadge status={issue.complaintStatus} />
                      </span>
                    ) : null}
                  </button>

                  <Link
                    href={`/issues/${issue.id}`}
                    className="shrink-0 self-center text-sm font-medium text-action hover:text-action-ink"
                  >
                    Open
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
