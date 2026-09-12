import { generateText } from "@/lib/gemini-service";
import type { AuthorityRecord, AuthorityIssue } from "@/lib/authority";
import type { ComplaintRequirements } from "@/lib/complaint-requirements";

export interface GeneratedComplaint {
  subject: string;
  body: string;
  imageUrl: string;
}

export interface GenerateComplaintInput {
  authority: AuthorityRecord;
  issue: AuthorityIssue & {
    severity?: string;
    shortDescription?: string;
    detailedDescription?: string;
  };
  location: { lat: number; lng: number; label?: string };
  imageUrl: string;
  requirements: ComplaintRequirements;
  reporterName?: string;
}

function fallbackComplaint(input: GenerateComplaintInput): GeneratedComplaint {
  const place = input.location.label ?? "the reported location";
  return {
    subject: `${input.issue.title ?? input.issue.issueType ?? "Civic issue"} at ${place}`,
    body: [
      `To the ${input.authority.department}, ${input.authority.name},`,
      "",
      `I am reporting a civic issue at ${place} (${input.location.lat.toFixed(4)}, ${input.location.lng.toFixed(4)}).`,
      "",
      input.issue.detailedDescription ?? input.issue.description ?? input.issue.shortDescription ?? "A civic issue was observed at this location.",
      "",
      `Assessed severity: ${input.issue.severity ?? "unknown"}. Please inspect and address this issue.`,
      "",
      "A supporting image is attached.",
      "",
      "Regards,",
      input.reporterName ?? "A CivicConnect reporter",
    ].join("\n"),
    imageUrl: input.imageUrl,
  };
}

export async function generateComplaint(input: GenerateComplaintInput): Promise<GeneratedComplaint> {
  const fallback = fallbackComplaint(input);
  if (!process.env.GEMINI_API_KEYS && !process.env.GEMINI_API_KEY) return fallback;

  try {
    const result = await generateText({
      systemInstruction: "Write a factual complaint email. Use only supplied facts. Return JSON with subject and body. Do not invent contact details, laws, dates, or claims.",
      prompt: JSON.stringify({
        authority: {
          name: input.authority.name,
          department: input.authority.department,
          jurisdiction: input.authority.jurisdiction,
        },
        issue: input.issue,
        location: input.location,
        requirements: input.requirements.requirements,
        reporterName: input.reporterName ?? "A CivicConnect reporter",
      }),
      responseSchema: {
        type: "object",
        properties: { subject: { type: "string" }, body: { type: "string" } },
        required: ["subject", "body"],
      },
    });
    const parsed = JSON.parse(result.text) as { subject?: string; body?: string };
    if (!parsed.subject?.trim() || !parsed.body?.trim()) return fallback;
    return { subject: parsed.subject.trim(), body: parsed.body.trim(), imageUrl: input.imageUrl };
  } catch {
    return fallback;
  }
}