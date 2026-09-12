import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { CURRENT_USER, listIssues, profileStats } from "@/lib/db/store";
import { timeAgo } from "@/lib/format";

export default async function ProfilePage() {
  const stats = profileStats(CURRENT_USER.id);
  const mine = listIssues({ authorId: CURRENT_USER.id }).slice(0, 5);

  return (
    <div className="mx-auto max-w-2xl">
      <header className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-2xl font-semibold text-white"
        >
          {CURRENT_USER.name.charAt(0)}
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight-display">
            {CURRENT_USER.name}
          </h1>
          <p className="text-[15px] text-muted">{CURRENT_USER.city}</p>
        </div>
      </header>

      <dl className="mt-6 grid grid-cols-3 overflow-hidden rounded-card border border-rule bg-surface">
        {[
          { label: "Reported", value: stats.reported },
          { label: "Supported", value: stats.supported },
          { label: "Resolved", value: stats.resolved },
        ].map((stat, index) => (
          <div
            key={stat.label}
            className={`px-4 py-5 ${index > 0 ? "border-l border-rule" : ""}`}
          >
            <dt className="text-[13px] text-muted">{stat.label}</dt>
            <dd className="mt-0.5 text-2xl font-semibold tracking-tight-display">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <section className="mt-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold tracking-tight-display">
            Recent activity
          </h2>
          <Link
            href="/my-issues"
            className="text-sm font-medium text-action hover:text-action-ink"
          >
            See all
          </Link>
        </div>

        {mine.length === 0 ? (
          <p className="mt-3 rounded-card border border-rule bg-surface p-5 text-[15px] text-muted">
            Nothing yet. Your first report will show up here.
          </p>
        ) : (
          <ul className="mt-3 overflow-hidden rounded-card border border-rule bg-surface">
            {mine.map((issue, index) => (
              <li
                key={issue.id}
                className={index > 0 ? "border-t border-rule" : ""}
              >
                <Link
                  href={`/issues/${issue.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-ground"
                >
                  <span className="min-w-0">
                    <span className="block text-[15px] font-medium">
                      {issue.analysis.title}
                    </span>
                    <span className="block text-[13px] text-muted">
                      {issue.location.label} · {timeAgo(issue.createdAt)}
                    </span>
                  </span>
                  {issue.complaintStatus ? (
                    <StatusBadge status={issue.complaintStatus} className="shrink-0" />
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
