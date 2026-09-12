import Link from "next/link";
import { notFound } from "next/navigation";
import AIAnalysisCard from "@/components/AIAnalysisCard";
import CommentThread from "@/components/CommentThread";
import IssuePhoto from "@/components/IssuePhoto";
import StatusBadge from "@/components/StatusBadge";
import UpvoteButton from "@/components/UpvoteButton";
import { PinIcon } from "@/components/icons";
import { getComplaint, getIssue } from "@/lib/db/store";
import { formatDateTime, timeAgo } from "@/lib/format";

export default async function IssuePage(props: PageProps<"/issues/[id]">) {
  const { id } = await props.params;
  const issue = getIssue(id);

  if (!issue) notFound();

  const complaint = issue.complaintId ? getComplaint(issue.complaintId) : undefined;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/"
        className="text-sm font-medium text-muted hover:text-ink"
      >
        Back to the feed
      </Link>

      <header className="mt-3">
        <h1 className="text-2xl font-bold tracking-tight-display sm:text-3xl">
          {issue.analysis.title}
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <PinIcon className="h-4 w-4" />
            {issue.location.label ?? "Location pinned"}
          </span>
          <span>
            Reported by {issue.authorName}, {timeAgo(issue.createdAt)}
          </span>
        </p>
      </header>

      <IssuePhoto
        src={issue.imageUrl}
        alt={issue.analysis.title}
        priority
        className="mt-4 aspect-[16/10] w-full rounded-card border border-rule"
      />

      {issue.description ? (
        <p className="mt-4 max-w-[68ch] border-l-2 border-rule pl-4 text-[15px] leading-6 text-ink">
          {issue.description}
        </p>
      ) : null}

      <div className="mt-4 flex items-center gap-4">
        <UpvoteButton
          issueId={issue.id}
          initialCount={issue.upvotes}
          initialVoted={false}
        />
        <Link
          href={{ pathname: "/map", query: { issue: issue.id } }}
          className="text-sm font-medium text-action hover:text-action-ink"
        >
          View on map
        </Link>
      </div>

      <div className="mt-6">
        <AIAnalysisCard
          analysis={issue.analysis}
          location={issue.location}
          authority={complaint?.authority}
        />
      </div>

      {complaint ? (
        <section className="on-agent mt-4 rounded-card bg-agent p-5 text-white sm:p-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-marking" />
            <h2 className="text-sm font-semibold tracking-tight-display">
              What the agent did
            </h2>
          </div>

          <p className="mt-3 font-mono text-[15px] text-marking">{complaint.id}</p>
          <p className="mt-1 text-sm text-agent-muted">
            Sent to {complaint.to} on {formatDateTime(complaint.submittedAt)}
          </p>

          <ol className="relative mt-5 space-y-3.5">
            <span
              className="absolute left-[5px] top-2 bottom-2 w-px bg-agent-rule"
              aria-hidden="true"
            />
            {complaint.timeline.map((entry, index) => (
              <li key={`${entry.label}-${index}`} className="relative flex gap-3">
                <span className="relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-marking" />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{entry.label}</span>
                  {entry.note ? (
                    <span className="block text-[13px] text-agent-muted">
                      {entry.note}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-5 flex items-center justify-between border-t border-agent-rule pt-4">
            <span className="rounded-chip bg-white/10 px-2 py-1">
              <StatusBadge status={complaint.status} className="!text-white" />
            </span>
            {complaint.channel === "simulated" ? (
              <span className="text-[13px] text-agent-muted">
                Demo submission — nothing was actually sent
              </span>
            ) : null}
          </div>
        </section>
      ) : (
        <section className="mt-4 rounded-card border border-rule bg-surface p-5">
          <p className="text-[15px] font-medium">No complaint filed yet</p>
          <p className="mt-1 text-sm text-muted">
            This report is in the feed but nothing has been sent to a department.
          </p>
        </section>
      )}

      <CommentThread issueId={issue.id} comments={issue.comments} />
    </div>
  );
}
