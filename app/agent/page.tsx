import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { getIssue, listComplaints } from "@/lib/db/store";
import { formatDateTime } from "@/lib/format";

/**
 * §8 — the agent's workspace.
 *
 * Deliberately not a chat window. It shows what the agent can do and what it
 * has actually done, because the claim being made is that it takes actions.
 */

const TOOLS = [
  {
    name: "Read the photo",
    detail: "Works out what the problem is and how severe it looks",
  },
  {
    name: "Check the location",
    detail: "Pins the issue and names the nearest landmark",
  },
  {
    name: "Find the authority",
    detail: "Matches the issue to the department that owns it",
  },
  {
    name: "Find the procedure",
    detail: "Works out how that department wants to be told",
  },
  {
    name: "Write the complaint",
    detail: "Drafts it with the photo and coordinates attached",
  },
  {
    name: "Submit and track",
    detail: "Sends it once you approve, then follows the status",
  },
] as const;

export default async function AgentPage() {
  const complaints = listComplaints().slice(0, 4);

  return (
    <div className="mx-auto max-w-2xl">
      <section className="on-agent rounded-card bg-agent p-6 text-white sm:p-8">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-marking" />
          <span className="text-sm font-semibold">Civic Agent</span>
        </div>

        <h1 className="mt-4 max-w-[20ch] text-2xl font-bold leading-tight tracking-tight-display sm:text-3xl">
          Give it a photo. It does the paperwork.
        </h1>

        <p className="mt-3 max-w-[58ch] text-[15px] leading-6 text-agent-muted">
          The agent reads the issue, finds the department responsible, writes the
          complaint and submits it — stopping once, to show you exactly what it
          is about to send.
        </p>

        <Link
          href="/report"
          className="mt-5 inline-block rounded-lg bg-marking px-5 py-2.5 text-[15px] font-semibold text-agent hover:bg-[#ffd45c]"
        >
          Start with a photo
        </Link>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold tracking-tight-display">
          What it can do
        </h2>
        <ul className="mt-3 overflow-hidden rounded-card border border-rule bg-surface">
          {TOOLS.map((tool, index) => (
            <li
              key={tool.name}
              className={`px-5 py-3.5 ${index > 0 ? "border-t border-rule" : ""}`}
            >
              <p className="text-[15px] font-medium">{tool.name}</p>
              <p className="text-sm text-muted">{tool.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold tracking-tight-display">
          What it has done
        </h2>

        {complaints.length === 0 ? (
          <p className="mt-3 rounded-card border border-rule bg-surface p-5 text-[15px] text-muted">
            No complaints filed yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {complaints.map((complaint) => {
              const issue = getIssue(complaint.issueId);
              return (
                <li key={complaint.id}>
                  <Link
                    href={
                      issue
                        ? (`/issues/${issue.id}` as const)
                        : ("/my-issues" as const)
                    }
                    className="block rounded-card border border-rule bg-surface p-4 hover:border-[#b9c6d1]"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-[15px] font-medium">
                        {issue?.analysis.title ?? complaint.subject}
                      </span>
                      <span className="font-mono text-[13px] text-muted">
                        {complaint.id}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {complaint.authority.name} ·{" "}
                      {formatDateTime(complaint.submittedAt)}
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={complaint.status} />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
