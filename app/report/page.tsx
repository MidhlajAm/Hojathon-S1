"use client";

import Link from "next/link";
import { useState } from "react";
import AIAnalysisCard from "@/components/AIAnalysisCard";
import AgentTimeline from "@/components/AgentTimeline";
import ImageUploader from "@/components/ImageUploader";
import IssuePhoto from "@/components/IssuePhoto";
import LocationField from "@/components/LocationField";
import { CheckIcon } from "@/components/icons";
import type {
  AnalyzeOutput,
  Authority,
  IssueAnalysis,
} from "@/lib/agent/types";
import { formatDateTime } from "@/lib/format";
import { DEFAULT_CENTER } from "@/lib/geo";
import type { GeoPoint } from "@/lib/types";
import { useAgentStream } from "@/lib/useAgentStream";

/**
 * The §20 journey, on one page.
 *
 * capture → analysing → analysis → submitting → submitted.
 */

type Phase =
  | "capture"
  | "analysing"
  | "analysis"
  | "submitting"
  | "submitted";

type WorkflowResult = {
  status: "submitted" | "failed" | "duplicate";
  complaintId?: string;
  recipientEmail?: string;
  issueId?: string;
  submittedAt?: string;
  authority?: { authority: Authority };
  error?: string;
  submission?: { messageId?: string };
};

export default function ReportPage() {
  const [phase, setPhase] = useState<Phase>("capture");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<GeoPoint | null>(null);

  const [analysis, setAnalysis] = useState<IssueAnalysis | null>(null);
  const [authority, setAuthority] = useState<Authority | null>(null);
  const [submission, setSubmission] = useState<WorkflowResult | null>(null);

  const stream = useAgentStream<AnalyzeOutput>();
  const place = location ?? DEFAULT_CENTER;

  async function analyse() {
    setPhase("analysing");
    const result = (await stream.run("/api/agent/analyze", {
      imageUrl,
      description: description || undefined,
      location: place,
    })) as AnalyzeOutput | null;

    // Stay on the agent view when this fails: dropping back to the capture
    // screen would hide the error card and leave the citizen guessing.
    if (!result) return;

    setAnalysis(result.analysis);
    void submitAutomatically(result.analysis);
  }

  async function submitAutomatically(analysisForWorkflow = analysis) {
    if (!analysisForWorkflow) return;
    setPhase("submitting");
    const response = await fetch("/api/agent/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageUrl,
        imageMimeType: "image/jpeg",
        location: place,
        description: description || undefined,
      }),
    });
    const result = (await response.json()) as WorkflowResult & { authority?: { name: string } };
    if (!response.ok || result.status === "failed") {
      setPhase("analysis");
      stream.reset();
      return;
    }
    const selectedAuthority = result.authority?.authority;
    setAuthority(selectedAuthority
      ? {
          id: selectedAuthority.id,
          name: selectedAuthority.name,
          department: selectedAuthority.department,
          email: result.recipientEmail ?? "",
          jurisdiction: selectedAuthority.jurisdiction,
        }
      : null);
    setSubmission(result);
    setPhase("submitted");
    // The success screen is short; without this the reader is left looking at
    // the empty space where the draft used to be.
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const busy = phase === "analysing" || phase === "submitting";
  const showTimeline = phase !== "capture";

  if (phase === "submitted" && submission) {
    return <SubmittedScreen submission={submission} analysis={analysis} authority={authority} />;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight-display sm:text-3xl">
          Report a civic issue
        </h1>
        <p className="mt-1.5 max-w-[62ch] text-[15px] leading-6 text-muted">
          A photo and a place is all the agent needs. It works out the rest and
          submits the complaint automatically.
        </p>
      </header>

      {phase === "capture" ? (
        <div className="space-y-4">
          <ImageUploader value={imageUrl} onChange={setImageUrl} />

          <LocationField value={location} onChange={setLocation} />

          <label className="block rounded-card border border-rule bg-surface p-4">
            <span className="text-[15px] font-medium">
              Anything you noticed
            </span>
            <span className="mt-0.5 block text-[13px] text-muted">
              Optional. One line helps the agent judge how urgent this is.
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="Two bikes went down here this week."
              className="mt-2 w-full resize-y rounded-lg border border-rule px-3 py-2 text-[15px] leading-6 focus:border-action focus:outline-none"
            />
          </label>

          <button
            type="button"
            onClick={analyse}
            disabled={!imageUrl}
            className="w-full rounded-lg bg-action px-5 py-3 text-[15px] font-semibold text-white hover:bg-action-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {imageUrl ? "Hand it to the agent" : "Add a photo to continue"}
          </button>
        </div>
      ) : null}

      {showTimeline ? (
        <div className="space-y-4">
          {imageUrl ? (
            <IssuePhoto
              src={imageUrl}
              alt="The photo you are reporting"
              className="aspect-[16/10] w-full rounded-card border border-rule"
              priority
            />
          ) : null}

          <AgentTimeline
            steps={stream.steps}
            goal={
              analysis
                ? `Report the ${analysis.title.toLowerCase()} at ${place.label ?? "the pinned location"}`
                : "Work out what this photo shows and who is responsible"
            }
          />

          {stream.error ? (
            <div className="rounded-card border border-sev-high/30 bg-surface p-5">
              <p className="text-[15px] font-medium text-ink">
                The agent stopped: {stream.error}
              </p>
              <p className="mt-1 text-sm text-muted">
                Nothing was sent. You can run it again.
              </p>
              <button
                type="button"
                onClick={() => {
                  stream.reset();
                  setPhase(analysis ? "analysis" : "capture");
                }}
                className="mt-3 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-agent"
              >
                Try again
              </button>
            </div>
          ) : null}

          {phase === "analysis" && analysis ? (
            <>
              {analysis.isCivicIssue ? (
                <>
                  <AIAnalysisCard analysis={analysis} location={place} />
                  <div className="flex flex-col gap-2 sm:flex-row-reverse">
                    <button
                      type="button"
                      onClick={() => void submitAutomatically()}
                      className="rounded-lg bg-action px-5 py-2.5 text-[15px] font-semibold text-white hover:bg-action-ink"
                    >
                      Analyze, submit, and track automatically
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        stream.reset();
                        setAnalysis(null);
                        setPhase("capture");
                      }}
                      className="rounded-lg border border-rule bg-surface px-5 py-2.5 text-[15px] font-semibold hover:bg-ground"
                    >
                      Start over
                    </button>
                  </div>
                </>
              ) : (
                <div className="rounded-card border border-rule bg-surface p-5">
                  <p className="text-[15px] font-medium">
                    This does not look like a civic issue.
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Try a photo that shows the problem itself — the road surface,
                    the waste pile, the unlit pole.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      stream.reset();
                      setAnalysis(null);
                      setImageUrl(null);
                      setPhase("capture");
                    }}
                    className="mt-3 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-agent"
                  >
                    Use a different photo
                  </button>
                </div>
              )}
            </>
          ) : null}

          {phase === "submitting" && analysis ? (
            <AIAnalysisCard analysis={analysis} location={place} authority={authority ?? undefined} />
          ) : null}

          {busy ? (
            <p className="text-center text-sm text-muted" role="status">
              The agent is working. You can leave this open.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function SubmittedScreen({
  submission,
  analysis,
  authority,
}: {
  submission: WorkflowResult;
  analysis: IssueAnalysis | null;
  authority: Authority | null;
}) {
  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-card border border-rule bg-surface p-6 text-center sm:p-8">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-resolved text-white">
          <CheckIcon className="h-7 w-7" strokeWidth={2.5} />
        </span>

        <h1 className="mt-4 text-2xl font-bold tracking-tight-display">
          Complaint submitted
        </h1>
        <p className="mt-2 font-mono text-lg text-ink">{submission.complaintId}</p>

        <dl className="mt-6 border-t border-rule text-left">
          {analysis ? (
            <div className="flex justify-between gap-4 border-b border-rule py-3">
              <dt className="text-muted">Issue</dt>
              <dd className="text-right font-medium">{analysis.title}</dd>
            </div>
          ) : null}
          {authority ? (
            <div className="flex justify-between gap-4 border-b border-rule py-3">
              <dt className="text-muted">Authority</dt>
              <dd className="text-right font-medium">{authority.name}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4 border-b border-rule py-3">
            <dt className="text-muted">Submitted</dt>
            <dd className="text-right font-medium">
              {submission.submittedAt ? formatDateTime(submission.submittedAt) : "Processing"}
            </dd>
          </div>
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-muted">Status</dt>
            <dd className="text-right font-medium">Under review</dd>
          </div>
        </dl>


        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
          <Link
            href={submission.issueId ? `/issues/${submission.issueId}` : "/my-issues"}
            className="flex-1 rounded-lg bg-action px-5 py-2.5 text-center text-[15px] font-semibold text-white hover:bg-action-ink"
          >
            Track this issue
          </Link>
          <Link
            href="/my-issues"
            className="flex-1 rounded-lg border border-rule px-5 py-2.5 text-center text-[15px] font-semibold hover:bg-ground"
          >
            All my reports
          </Link>
        </div>
      </div>
    </div>
  );
}
