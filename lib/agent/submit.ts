import { allocateComplaintId } from "../db/store";
import { wait } from "./stream";
import type { Authority, ComplaintAgent } from "./types";

/**
 * AGENT 2 — AUTHORITY ROUTING AND COMPLAINT SUBMISSION.  ← teammate implementation
 *
 * Replace the three method bodies below. The frontend calls them in order and
 * stops in between: the citizen sees the draft and must press "Confirm & submit"
 * before `submitComplaint` is ever reached. Keep that separation — it is the
 * §9 guarantee that nothing leaves the platform without approval.
 *
 * Rules of the seam:
 *  - Emit steps the same way Agent 1 does; same id re-emitted updates in place.
 *  - Throw to fail. The UI shows a failed step and offers a retry.
 *  - `submitComplaint` must return a tracking id. Use `allocateComplaintId()`
 *    from `lib/db/store` unless the channel hands you its own reference.
 *  - `channel: "simulated"` means nothing was actually sent. Return that value
 *    honestly whenever the send is mocked — the UI labels the result accordingly,
 *    and a demo that claims a real submission it did not make is worse than one
 *    that says "simulated".
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

    const authority = authorityForCategory(analysis.category);

    emit({
      id: "authority",
      label: "Responsible authority identified",
      status: "done",
      detail: `${authority.name} — ${authority.jurisdiction}`,
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

    const body = [
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

    emit({
      id: "draft",
      label: "Complaint prepared",
      status: "done",
      detail: `${body.split(/\s+/).length} words, 1 photo attached`,
    });

    emit({
      id: "confirm",
      label: "Waiting for your confirmation",
      status: "active",
      detail: "Nothing is sent until you approve it",
    });

    return {
      to: input.authority.email,
      subject,
      body,
      attachments: [{ name: "issue-photo.jpg", url: input.imageUrl }],
      location: input.location,
    };
  },

  async submitComplaint(draft, emit, signal) {
    emit({
      id: "confirm",
      label: "Confirmed by the reporter",
      status: "done",
    });

    emit({ id: "submit", label: "Submitting the complaint", status: "active" });
    await wait(1400, signal);

    const complaintId = allocateComplaintId();

    emit({
      id: "submit",
      label: "Complaint submitted",
      status: "done",
      detail: `Sent to ${draft.to}`,
    });

    emit({
      id: "track",
      label: "Tracking started",
      status: "done",
      detail: complaintId,
    });

    return {
      complaintId,
      status: "under_review",
      submittedAt: new Date().toISOString(),
      // Honest: the mock sends nothing. Change to "email" once a real send lands.
      channel: "simulated",
      receipt: "Demo submission — no message left this machine",
    };
  },
};
