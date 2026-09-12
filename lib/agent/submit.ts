import { generateText } from "../gemini-service";
import { findAuthority as detectAuthority } from "../authority";
import { wait } from "./stream";
import type { Authority, ComplaintAgent } from "./types";

/**
 * AGENT 2 — AUTHORITY ROUTING AND COMPLAINT SUBMISSION.  ← teammate implementation
 *
 * Rules of the seam:
 *  - Emit steps the same way Agent 1 does; same id re-emitted updates in place.
 *  - Throw to fail. The UI shows a failed step and offers a retry.
 */

/** Stand-in routing table. The real agent should resolve this per jurisdiction. */
const AUTHORITIES: Record<string, Authority> = {
  road: {
    id: "auth-roads",
    name: "Local Road Authority",
    department: "Public Works — Roads",
    email: "road.authority@example.gov",
    jurisdiction: "Kochi Corporation",
  },
  waste: {
    id: "auth-waste",
    name: "Municipal Health Wing",
    department: "Solid Waste Management",
    email: "waste.desk@example.gov",
    jurisdiction: "Kochi Corporation",
  },
  streetlight: {
    id: "auth-lighting",
    name: "Electrical Division",
    department: "Street Lighting",
    email: "lighting@example.gov",
    jurisdiction: "Kochi Corporation",
  },
  water: {
    id: "auth-water",
    name: "Water Authority",
    department: "Distribution — Kochi Division",
    email: "leaks@example.gov",
    jurisdiction: "Kerala Water Authority",
  },
  environment: {
    id: "auth-environment",
    name: "Municipal Environment Cell",
    department: "Urban Forestry and Environment",
    email: "environment@example.gov",
    jurisdiction: "Kochi Corporation",
  },
  public_property: {
    id: "auth-property",
    name: "Municipal Asset Maintenance Division",
    department: "Public Property and Facilities",
    email: "property.maintenance@example.gov",
    jurisdiction: "Kochi Corporation",
  },
  other: {
    id: "auth-general",
    name: "Municipal Grievance Cell",
    department: "General Complaints",
    email: "grievance@example.gov",
    jurisdiction: "Kochi Corporation",
  },
  drainage: {
    id: "auth-drainage",
    name: "Drainage Division",
    department: "Storm Water Drainage",
    email: "drainage@example.gov",
    jurisdiction: "Kochi Corporation",
  },
};

const FALLBACK_AUTHORITY: Authority = {
  id: "auth-general",
  name: "Municipal Grievance Cell",
  department: "General Complaints",
  email: "grievance@example.gov",
  jurisdiction: "Kochi Corporation",
};

export function authorityForCategory(category: string): Authority {
  return AUTHORITIES[category] ?? FALLBACK_AUTHORITY;
}

export const complaintAgent: ComplaintAgent = {
  async findAuthority(analysis, location, emit, signal) {
    emit({ id: "authority", label: "Finding who is responsible", status: "active" });
    await wait(1000, signal);

    const match = await detectAuthority(
      {
        category: analysis.category,
        title: analysis.title,
        description: analysis.summary,
      },
      location,
    );
    const authority: Authority = {
      id: match.authority.id,
      name: match.authority.name,
      department: match.authority.department,
      email: match.authority.officialEmail ?? FALLBACK_AUTHORITY.email,
      jurisdiction: match.authority.jurisdiction,
      officialEmailVerified: match.authority.officialEmailVerified,
      officialEmailSource: match.authority.officialEmailSource,
    };

    emit({
      id: "authority",
      label: "Responsible authority identified",
      status: "done",
      detail: `${authority.name} - ${authority.jurisdiction} (${match.source})`,
    });

    emit({ id: "procedure", label: "Finding the complaint procedure", status: "active" });
    await wait(900, signal);
    emit({
      id: "procedure",
      label: "Complaint procedure found",
      status: "done",
      detail: `Written complaint to ${authority.email}, photo and location attached`,
    });

    void location;
    return authority;
  },

  async draftComplaint(input, emit, signal) {
    emit({ id: "draft", label: "Preparing the complaint", status: "active" });
    await wait(1200, signal);

    const place = input.location.label ?? "the reported location";
    const subject = `${input.analysis.title} at ${place}`;

    const fallbackBody = [
      `To the ${input.authority.department}, ${input.authority.name},`,
      "",
      `I am reporting a civic issue at ${place} (${input.location.lat.toFixed(4)}, ${input.location.lng.toFixed(4)}).`,
      "",
      input.analysis.summary,
      "",
      input.description
        ? `The reporter adds: "${input.description}"`
        : "A photograph taken at the location is attached.",
      "",
      `Assessed severity: ${input.analysis.severity}. I request an inspection and repair at the earliest, and would be grateful for an acknowledgement with a reference number.`,
      "",
      "Regards,",
      input.reporterName,
      "Submitted through CivicConnect",
    ].join("\n");

    let body = fallbackBody;
    if (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY) {
      try {
        const generated = await generateText({
          systemInstruction: "Write concise, factual civic authority complaint emails. Do not invent facts, threats, laws, or contact details.",
          prompt: `Write the email body only for this civic issue.\nAuthority: ${input.authority.name}, ${input.authority.department}\nLocation: ${place}\nCoordinates: ${input.location.lat}, ${input.location.lng}\nIssue: ${input.analysis.title}\nSummary: ${input.analysis.summary}\nSeverity: ${input.analysis.severity}\nReporter notes: ${input.description ?? "none"}\nReporter name: ${input.reporterName}`,
        });
        if (generated.text.trim()) body = generated.text.trim();
      } catch {
        // The deterministic complaint remains usable when Gemini is unavailable.
      }
    }

    emit({
      id: "draft",
      label: "Complaint prepared",
      status: "done",
      detail: `${body.split(/\s+/).length} words, 1 photo attached`,
    });

    return {
      to: input.authority.email,
      subject,
      body,
      attachments: [{ name: "issue-photo.jpg", url: input.imageUrl }],
      location: input.location,
    };
  },

};
