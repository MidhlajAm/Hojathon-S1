import {
  analyzeImage,
  GeminiServiceError,
  type GeminiImage,
} from "@/lib/gemini-service";

export type IssueCategory =
  | "road"
  | "waste"
  | "streetlight"
  | "water"
  | "environment"
  | "public_property"
  | "other";

export type IssueType =
  | "pothole_road_damage"
  | "garbage"
  | "broken_streetlight"
  | "water_leakage"
  | "fallen_tree"
  | "damaged_public_property"
  | "other_civic_issue";

export type IssueSeverity = "low" | "medium" | "high" | "critical";

export interface AnalyzeIssueInput {
  image: GeminiImage;
  additionalContext?: string;
  model?: string;
}

export interface IssueAnalysisResult {
  category: IssueCategory;
  issueType: IssueType;
  severity: IssueSeverity;
  shortDescription: string;
  detailedDescription: string;
  confidence: number;
}

const ISSUE_ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    category: {
      type: "string",
      enum: ["road", "waste", "streetlight", "water", "environment", "public_property", "other"],
    },
    issueType: {
      type: "string",
      enum: [
        "pothole_road_damage",
        "garbage",
        "broken_streetlight",
        "water_leakage",
        "fallen_tree",
        "damaged_public_property",
        "other_civic_issue",
      ],
    },
    severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
    shortDescription: { type: "string" },
    detailedDescription: { type: "string" },
    confidence: { type: "number", minimum: 0, maximum: 1 },
  },
  required: [
    "category",
    "issueType",
    "severity",
    "shortDescription",
    "detailedDescription",
    "confidence",
  ],
  propertyOrdering: [
    "category",
    "issueType",
    "severity",
    "shortDescription",
    "detailedDescription",
    "confidence",
  ],
} as const;

const CATEGORIES = new Set<IssueCategory>([
  "road",
  "waste",
  "streetlight",
  "water",
  "environment",
  "public_property",
  "other",
]);
const ISSUE_TYPES = new Set<IssueType>([
  "pothole_road_damage",
  "garbage",
  "broken_streetlight",
  "water_leakage",
  "fallen_tree",
  "damaged_public_property",
  "other_civic_issue",
]);
const SEVERITIES = new Set<IssueSeverity>(["low", "medium", "high", "critical"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseAnalysis(text: string): IssueAnalysisResult {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (error) {
    throw new GeminiServiceError("PROVIDER_ERROR", "Gemini returned invalid analysis JSON.", error);
  }

  if (
    !isRecord(value) ||
    typeof value.category !== "string" || !CATEGORIES.has(value.category as IssueCategory) ||
    typeof value.issueType !== "string" || !ISSUE_TYPES.has(value.issueType as IssueType) ||
    typeof value.severity !== "string" || !SEVERITIES.has(value.severity as IssueSeverity) ||
    typeof value.shortDescription !== "string" || !value.shortDescription.trim() ||
    typeof value.detailedDescription !== "string" || !value.detailedDescription.trim() ||
    typeof value.confidence !== "number" || !Number.isFinite(value.confidence) ||
    value.confidence < 0 || value.confidence > 1
  ) {
    throw new GeminiServiceError("PROVIDER_ERROR", "Gemini returned analysis outside the required schema.");
  }

  return {
    category: value.category as IssueCategory,
    issueType: value.issueType as IssueType,
    severity: value.severity as IssueSeverity,
    shortDescription: value.shortDescription.trim(),
    detailedDescription: value.detailedDescription.trim(),
    confidence: value.confidence,
  };
}

export async function analyzeIssue(input: AnalyzeIssueInput): Promise<IssueAnalysisResult> {
  const result = await analyzeImage({
    image: input.image,
    model: input.model,
    responseSchema: ISSUE_ANALYSIS_SCHEMA,
    systemInstruction:
      "You analyze civic issue photographs. Classify only visible public or civic problems. If uncertain, use other_civic_issue and lower confidence.",
    prompt: `Analyze this civic issue image and return the required JSON object. Support potholes or road damage, garbage, broken streetlights, water leakage, fallen trees, damaged public property, and other civic issues.\nAdditional context: ${input.additionalContext ?? "none"}`,
  });

  return parseAnalysis(result.text);
}

export { ISSUE_ANALYSIS_SCHEMA };