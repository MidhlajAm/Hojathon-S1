import Link from "next/link";
import { timeAgo } from "@/lib/format";
import type { Issue } from "@/lib/types";
import IssuePhoto from "./IssuePhoto";
import SeverityBadge from "./SeverityBadge";
import StatusBadge from "./StatusBadge";
import UpvoteButton from "./UpvoteButton";
import { CommentIcon, PinIcon } from "./icons";

export default function IssueCard({
  issue,
  priority = false,
}: {
  issue: Issue;
  priority?: boolean;
}) {
  return (
    <article className="overflow-hidden rounded-card border border-rule bg-surface">
      <header className="flex items-center gap-2 px-4 pt-4 text-sm">
        <span
          aria-hidden="true"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-ground text-xs font-semibold text-ink"
        >
          {issue.authorName.charAt(0)}
        </span>
        <span className="font-semibold text-ink">{issue.authorName}</span>
        <span className="text-muted">{timeAgo(issue.createdAt)}</span>
      </header>

      <p className="flex items-center gap-1.5 px-4 pt-1.5 text-sm text-muted">
        <PinIcon className="h-4 w-4 shrink-0" />
        {issue.location.label ?? "Location pinned"}
      </p>

      <Link href={`/issues/${issue.id}`} className="mt-3 block">
        <IssuePhoto
          src={issue.imageUrl}
          alt={issue.analysis.title}
          priority={priority}
          className="aspect-[16/10] w-full"
        />
      </Link>

      <div className="px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight-display">
            <Link href={`/issues/${issue.id}`} className="hover:text-action">
              {issue.analysis.title}
            </Link>
          </h2>
          <SeverityBadge severity={issue.analysis.severity} />
        </div>

        <p className="mt-2 max-w-[68ch] text-[15px] leading-6 text-muted">
          {issue.analysis.summary}
        </p>

        <div className="mt-4 flex items-center gap-4 text-sm">
          <UpvoteButton
            issueId={issue.id}
            initialCount={issue.upvotes}
            initialVoted={false}
          />
          <Link
            href={`/issues/${issue.id}`}
            className="flex items-center gap-1.5 font-medium text-muted hover:text-ink"
          >
            <CommentIcon className="h-[18px] w-[18px]" />
            {issue.comments.length}
          </Link>
          <Link
            href={{ pathname: "/map", query: { issue: issue.id } }}
            className="ml-auto flex items-center gap-1.5 font-medium text-action hover:text-action-ink"
          >
            <PinIcon className="h-[18px] w-[18px]" />
            View on map
          </Link>
        </div>
      </div>

      {/* The agent strip. Dark, so the machine's contribution is never mistaken
          for something a neighbour wrote. */}
      {issue.complaintId && issue.complaintStatus ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-agent px-4 py-3 text-sm text-white">
          <span className="font-medium">Complaint submitted by the agent</span>
          <span className="font-mono text-[13px] text-marking">
            {issue.complaintId}
          </span>
          <span className="ml-auto rounded-chip bg-white/10 px-2 py-0.5">
            <StatusBadge status={issue.complaintStatus} className="!text-white" />
          </span>
        </div>
      ) : null}
    </article>
  );
}
