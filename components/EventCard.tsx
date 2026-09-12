import Link from "next/link";
import { formatDay } from "@/lib/format";
import { DEFAULT_CENTER, distanceKm, formatDistance } from "@/lib/geo";
import type { CivicEvent } from "@/lib/types";
import { CalendarIcon, PinIcon } from "./icons";

export default function EventCard({
  event,
  recommendation,
}: {
  event: CivicEvent;
  recommendation?: { reason: string; issueTitle?: string; issueId: string };
}) {
  const away = formatDistance(distanceKm(DEFAULT_CENTER, event.location));

  return (
    <article className="overflow-hidden rounded-card border border-rule bg-surface">
      <div className="p-5">
        <h3 className="text-[17px] font-semibold tracking-tight-display">
          {event.title}
        </h3>

        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <CalendarIcon className="h-4 w-4" />
            {formatDay(event.startsAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <PinIcon className="h-4 w-4" />
            {event.venue}, {away} away
          </span>
        </p>

        <p className="mt-3 max-w-[64ch] text-[15px] leading-6">{event.summary}</p>
        <p className="mt-2 text-sm text-muted">Organised by {event.organiser}</p>
      </div>

      {recommendation ? (
        <div className="on-agent bg-agent px-5 py-3 text-sm text-white">
          <p>
            <span className="font-medium text-marking">Agent suggestion.</span>{" "}
            {recommendation.reason}
          </p>
          {recommendation.issueTitle ? (
            <Link
              href={`/issues/${recommendation.issueId}`}
              className="mt-1 inline-block text-[13px] text-agent-muted underline hover:text-white"
            >
              {recommendation.issueTitle}
            </Link>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
