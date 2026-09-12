import { wait } from "./stream";
import type { AnalyzeAgent, AnalyzeInput, AnalyzeOutput, Emit, Severity } from "./types";

/**
 * AGENT 1 — ISSUE ANALYSIS.  ← teammate implementation goes here
 *
 * Replace the body of `analyzeIssue` with the real Gemini vision call. Keep the
 * signature and keep calling `emit` as you go; the UI is driven entirely by
 * those steps and needs no changes when you land.
 *
 * A working shape:
 *
 *   export const analyzeIssue: AnalyzeAgent = async (input, emit, signal) => {
 *     emit({ id: "read", label: "Reading the photo", status: "active" });
 *     const model = getGemini();                       // lib/gemini.ts
 *     const result = await model.generateContent([...]); // pass input.imageUrl
 *     emit({ id: "read", label: "Photo read", status: "done" });
 *     ...
 *     return { analysis, duplicates };
 *   };
 *
 * Rules of the seam:
 *  - Emit a step as `active` when you start it, then re-emit the same `id` as
 *    `done` with a `detail` carrying what you found. Same id updates in place.
 *  - Throw to fail. The stream turns a throw into a failed step plus an error
 *    frame, and the UI offers a retry — do not swallow errors into a fake result.
 *  - Honour `signal`; the user can navigate away mid-analysis.
 *  - `isCivicIssue: false` is a valid, useful answer. The UI stops the flow and
 *    tells the citizen the photo doesn't look like a civic problem.
 */

/** Keyword fallback so the mock reacts to what the user typed. */
const MOCK_PROFILES: Record<
  string,
  { title: string; category: string; severity: Severity; summary: string; tags: string[] }
> = {
  pothole: {
    title: "Severe pothole",
    category: "road",
    severity: "high",
    summary:
      "Large road damage across the carriageway, deep enough to throw a two-wheeler off line. Standing water suggests it has been widening for some weeks.",
    tags: ["pothole", "road damage", "two-wheeler hazard"],
  },
  garbage: {
    title: "Uncollected waste pile",
    category: "waste",
    severity: "medium",
    summary:
      "Mixed household waste dumped outside the collection point and spreading onto the footpath. Likely a missed collection rather than illegal dumping.",
    tags: ["waste", "collection", "public health"],
  },
  streetlight: {
    title: "Streetlight out",
    category: "streetlight",
    severity: "medium",
    summary:
      "Pole-mounted light is dark with no visible damage to the fitting, so the lamp or the feeder circuit has most likely failed.",
    tags: ["streetlight", "night safety"],
  },
  water: {
    title: "Pipeline leak",
    category: "water",
    severity: "high",
    summary:
      "Continuous flow from a buried main is undercutting the road edge. Water loss looks significant and the surface is already subsiding.",
    tags: ["water", "leak", "road subsidence"],
  },
  drain: {
    title: "Blocked drain",
    category: "drainage",
    severity: "high",
    summary:
      "Silt and plastic have choked the drain mouth, so runoff is backing up across the road. This floods quickly in heavy rain.",
    tags: ["drainage", "flooding"],
  },
};

/**
 * Ordered most-specific first: "the drain floods with water" must read as a
 * drain, not a water main. A real vision model has no such problem.
 */
const KEYWORDS: [RegExp, keyof typeof MOCK_PROFILES][] = [
  [/pothole|road damage|crater/, "pothole"],
  [/drain|flood|sewer|manhole/, "drain"],
  [/street ?light|lamp|unlit|dark at night/, "streetlight"],
  [/garbage|waste|rubbish|dump|litter/, "garbage"],
  [/pipe|leak|water main|burst/, "water"],
];

function pickProfile(input: AnalyzeInput) {
  const haystack = `${input.description ?? ""} ${input.imageUrl}`.toLowerCase();
  for (const [pattern, key] of KEYWORDS) {
    if (pattern.test(haystack)) return MOCK_PROFILES[key];
  }
  return MOCK_PROFILES.pothole;
}

/**
 * Mock implementation. Emits the same steps a real agent would, paced so the
 * timeline is exercised end to end. Delete everything below the signature when
 * you wire Gemini in.
 */
export const analyzeIssue: AnalyzeAgent = async (
  input,
  emit: Emit,
  signal,
): Promise<AnalyzeOutput> => {
  const profile = pickProfile(input);

  emit({ id: "read", label: "Reading the photo", status: "active" });
  await wait(900, signal);
  emit({
    id: "read",
    label: "Photo read",
    status: "done",
    detail: "Daylight street-level image, subject in focus",
  });

  emit({ id: "classify", label: "Identifying the issue", status: "active" });
  await wait(1100, signal);
  emit({
    id: "classify",
    label: "Issue identified",
    status: "done",
    detail: profile.title,
  });

  emit({ id: "severity", label: "Estimating severity", status: "active" });
  await wait(800, signal);
  emit({
    id: "severity",
    label: "Severity estimated",
    status: "done",
    detail: `${profile.severity[0].toUpperCase()}${profile.severity.slice(1)}`,
  });

  emit({ id: "location", label: "Checking the location", status: "active" });
  await wait(700, signal);
  emit({
    id: "location",
    label: "Location confirmed",
    status: "done",
    detail: input.location?.label ?? "Location supplied by the reporter",
  });

  emit({ id: "duplicates", label: "Looking for existing reports", status: "active" });
  await wait(700, signal);
  emit({
    id: "duplicates",
    label: "Checked against nearby reports",
    status: "done",
    detail: "No matching report within 200 m",
  });

  return {
    analysis: {
      isCivicIssue: true,
      title: profile.title,
      category: profile.category,
      summary: profile.summary,
      severity: profile.severity,
      confidence: 0.88,
      tags: profile.tags,
    },
  };
};
