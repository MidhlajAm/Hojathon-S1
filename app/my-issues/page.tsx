import Link from "next/link";
import FilterTabs from "@/components/FilterTabs";
import IssuePhoto from "@/components/IssuePhoto";
import SeverityBadge from "@/components/SeverityBadge";
import StatusBadge from "@/components/StatusBadge";
import { PinIcon } from "@/components/icons";
import { CURRENT_USER, listIssues } from "@/lib/db/store";
import { timeAgo } from "@/lib/format";
import type { ComplaintStatus } from "@/lib/types";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under review" },
  { value: "in_progress", label: "Work started" },
  { value: "resolved", label: "Resolved" },
] as const;

export default async function MyIssuesPage(props: PageProps<"/my-issues">) {
  const searchParams = await props.searchParams;
  const raw = typeof searchParams.status === "string" ? searchParams.status : "all";
  const status = (FILTERS.some((option) => option.value === raw)
    ? raw
    : "all") as ComplaintStatus | "all";

  const issues = listIssues({ authorId: CURRENT_USER.id, status });

  return (
    <div className="mx-auto max-w-2xl">
      <header>
        <h1 className="text-2xl font-bold tracking-tight-display sm:text-3xl">
          My reports
        </h1>
        <p className="mt-1.5 text-[15px] text-muted">
          Everything you have filed, and where each one has got to.
        </p>
      </header>

      <div className="mt-5">
        <FilterTabs
          basePath="/my-issues"
          param="status"
          options={FILTERS}
          active={status}
        />
      </div>

      {issues.length === 0 ? (
        <div className="mt-6 rounded-card border border-rule bg-surface p-6">
          <p className="text-[15px] font-medium">
            {status === "all"
              ? "You have not reported anything yet."
              : "Nothing of yours is at that stage."}
          </p>
          <p className="mt-1 text-sm text-muted">
            {status === "all"
              ? "The next broken thing you walk past takes about twenty seconds to file."
              : "Try another filter, or look at everything."}
          </p>
          <Link
            href="/report"
            className="mt-4 inline-block rounded-lg bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-action-ink"
          >
            Report an issue
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {issues.map((issue) => (
            <li key={issue.id}>
              <Link
                href={`/issues/${issue.id}`}
                className="flex gap-4 rounded-card border border-rule bg-surface p-3 transition-colors hover:border-[#b9c6d1]"
              >
                <IssuePhoto
                  src={issue.imageUrl}
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-lg sm:h-24 sm:w-24"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[17px] font-semibold tracking-tight-display">
                      {issue.analysis.title}
                    </h2>
                    <SeverityBadge severity={issue.analysis.severity} />
                  </div>

                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                    <PinIcon className="h-4 w-4 shrink-0" />
                    {issue.location.label ?? "Location pinned"}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                    {issue.complaintStatus ? (
                      <StatusBadge status={issue.complaintStatus} />
                    ) : (
                      <span className="text-xs font-semibold text-muted">
                        No complaint filed
                      </span>
                    )}
                    {issue.complaintId ? (
                      <span className="font-mono text-[13px] text-muted">
                        {issue.complaintId}
                      </span>
                    ) : null}
                    <span className="text-[13px] text-muted">
                      {timeAgo(issue.createdAt)}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
