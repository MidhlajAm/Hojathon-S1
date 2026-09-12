import { SEVERITY_LABEL } from "@/lib/format";
import type { Severity } from "@/lib/types";

/**
 * Sign colours, used functionally. A severity chip is the one place red appears
 * in the citizen surface, so it stays readable at a glance in the feed.
 */
const STYLES: Record<Severity, string> = {
  critical: "bg-sev-critical text-white",
  high: "bg-sev-high text-white",
  medium: "bg-sev-medium text-[#4a3208]",
  low: "bg-sev-low text-white",
};

export default function SeverityBadge({
  severity,
  className = "",
}: {
  severity: Severity;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-chip px-2 py-0.5 text-xs font-semibold ${STYLES[severity]} ${className}`}
    >
      {SEVERITY_LABEL[severity]} severity
    </span>
  );
}
