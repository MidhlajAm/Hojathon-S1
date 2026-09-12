/**
 * THE AGENT CONTRACT
 * ==================
 *
 * This file is the boundary between the frontend and the two agents.
 * The frontend depends only on what is declared here; it never reaches past it.
 *
 *   Agent 1 (analysis)   -> implements `AnalyzeAgent`   in `lib/agent/analyze.ts`
 *   Agent 2 (complaint)  -> implements `ComplaintAgent` in `lib/agent/submit.ts`
 *
 * Both report progress by calling `emit(step)`. Every emitted step is streamed
 * to the browser over SSE and drawn on the agent timeline as it arrives, so the
 * user watches real work happen rather than a scripted animation. Emit early,
 * emit often, and mark a step `done` before starting the next one.
 *
 * See `lib/agent/README.md` for the integration walkthrough.
 */

export type Severity = "low" | "medium" | "high" | "critical";

export type StepStatus = "pending" | "active" | "done" | "failed";

/** One line on the agent timeline. Re-emit the same `id` to update it in place. */
export interface AgentStep {
  id: string;
  label: string;
  status: StepStatus;
  /** Optional second line, e.g. the value the step resolved. */
  detail?: string;
}

export interface GeoPoint {
  lat: number;
  lng: number;
  label?: string;
}

/** What the analysis agent concluded about the photo. */
export interface IssueAnalysis {
  /** False when the photo is not a civic issue at all; the UI stops the flow. */
  isCivicIssue: boolean;
  /** Short headline, e.g. "Severe pothole". Shown as the issue title. */
  title: string;
  /** Category slug, e.g. "road", "waste", "streetlight", "water", "drainage". */
  category: string;
  /** One or two sentences of plain-language analysis shown to the citizen. */
  summary: string;
  severity: Severity;
  /** 0-1. Rendered as a confidence chip; values under 0.6 prompt the user to confirm. */
  confidence: number;
  tags: string[];
}

export interface Authority {
  id: string;
  name: string;
  department: string;
  email: string;
  phone?: string;
  jurisdiction: string;
}

export interface DuplicateMatch {
  issueId: string;
  title: string;
  distanceKm: number;
  /** 0-1 similarity the agent assigned. */
  score: number;
}

export interface ComplaintDraft {
  to: string;
  cc?: string[];
  subject: string;
  body: string;
  attachments: { name: string; url: string }[];
  location: GeoPoint;
}

export type SubmissionChannel = "email" | "portal" | "simulated";

export interface SubmissionResult {
  /** Tracking id in CIV-YYYY-NNNN form. Use `allocateComplaintId()` from lib/db/store. */
  complaintId: string;
  status: "submitted" | "under_review";
  submittedAt: string;
  channel: SubmissionChannel;
  /** Anything the channel handed back — message id, portal reference, etc. */
  receipt?: string;
}

/** Progress callback handed to every agent method. */
export type Emit = (step: AgentStep) => void;

export interface AnalyzeInput {
  imageUrl: string;
  description?: string;
  location?: GeoPoint;
}

export interface AnalyzeOutput {
  analysis: IssueAnalysis;
  /** Optional: existing reports the agent believes describe the same problem. */
  duplicates?: DuplicateMatch[];
}

/**
 * Agent 1. Given a photo (plus whatever the citizen typed and where they were),
 * work out what the civic issue is and how bad it is.
 */
export type AnalyzeAgent = (
  input: AnalyzeInput,
  emit: Emit,
  signal?: AbortSignal,
) => Promise<AnalyzeOutput>;

export interface DraftInput {
  analysis: IssueAnalysis;
  authority: Authority;
  location: GeoPoint;
  imageUrl: string;
  description?: string;
  reporterName: string;
}

/**
 * Agent 2. Route the issue to the right desk, write the complaint, send it.
 * Each method is called separately so the UI can show the citizen the draft
 * and get explicit approval before `submitComplaint` ever runs.
 */
export interface ComplaintAgent {
  findAuthority(
    analysis: IssueAnalysis,
    location: GeoPoint,
    emit: Emit,
    signal?: AbortSignal,
  ): Promise<Authority>;

  draftComplaint(
    input: DraftInput,
    emit: Emit,
    signal?: AbortSignal,
  ): Promise<ComplaintDraft>;

  submitComplaint(
    draft: ComplaintDraft,
    emit: Emit,
    signal?: AbortSignal,
  ): Promise<SubmissionResult>;
}

/** Frames the SSE routes put on the wire. */
export type AgentEvent =
  | { type: "step"; step: AgentStep }
  | { type: "result"; result: unknown }
  | { type: "error"; message: string };
