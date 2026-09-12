import type { Authority, IssueAnalysis } from "@/lib/agent/types";
import { formatCoords } from "@/lib/geo";
import type { GeoPoint } from "@/lib/types";
import SeverityBadge from "./SeverityBadge";
import { BuildingIcon, PinIcon } from "./icons";

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-rule px-5 py-3.5 first:border-t-0">
      <dt className="text-[13px] text-muted">{label}</dt>
      <dd className="mt-0.5 text-[15px] font-medium leading-6 text-ink">
        {children}
      </dd>
    </div>
  );
}

export default function AIAnalysisCard({
  analysis,
  location,
  authority,
}: {
  analysis: IssueAnalysis;
  location: GeoPoint;
  authority?: Authority;
}) {
  return (
    <section className="overflow-hidden rounded-card border border-rule bg-surface">
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight-display">
            {analysis.title}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {Math.round(analysis.confidence * 100)}% confident. Correct it if the
            agent read the photo wrong.
          </p>
        </div>
        <SeverityBadge severity={analysis.severity} className="mt-1 shrink-0" />
      </div>

      <p className="max-w-[68ch] px-5 pb-4 pt-3 text-[15px] leading-6 text-ink">
        {analysis.summary}
      </p>

      <dl className="border-t border-rule">
        <Row label="Location">
          <span className="flex items-start gap-2">
            <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
            <span>
              {location.label ?? "Pinned location"}
              <span className="mt-0.5 block font-mono text-[13px] font-normal text-muted">
                {formatCoords(location)}
              </span>
            </span>
          </span>
        </Row>

        {authority ? (
          <Row label="Responsible authority">
            <span className="flex items-start gap-2">
              <BuildingIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
              <span>
                {authority.name}
                <span className="mt-0.5 block text-[13px] font-normal text-muted">
                  {authority.department}
                  {authority.jurisdiction ? ` · ${authority.jurisdiction}` : ""}
                </span>
              </span>
            </span>
          </Row>
        ) : null}

        {analysis.tags.length > 0 ? (
          <Row label="What the agent noticed">
            <span className="flex flex-wrap gap-1.5">
              {analysis.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-chip bg-ground px-2 py-0.5 text-[13px] font-normal text-muted"
                >
                  {tag}
                </span>
              ))}
            </span>
          </Row>
        ) : null}
      </dl>
    </section>
  );
}
