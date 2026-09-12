import { STATUS_LABEL } from "@/lib/format";
import type { ComplaintStatus } from "@/lib/types";

const DOT: Record<ComplaintStatus, string> = {
  draft: "bg-unknown",
  submitted: "bg-action",
  under_review: "bg-sev-medium",
  in_progress: "bg-sev-medium",
  resolved: "bg-resolved",
  rejected: "bg-sev-high",
};

export default function StatusBadge({
  status,
  className = "",
}: {
  status: ComplaintStatus;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold text-ink ${className}`}
    >
      <span className={`h-2 w-2 rounded-full ${DOT[status]}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}
