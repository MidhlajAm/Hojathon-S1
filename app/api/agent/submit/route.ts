import { agentStream } from "@/lib/agent/stream";
import { complaintAgent } from "@/lib/agent/submit";
import type {
  Authority,
  ComplaintDraft,
  IssueAnalysis,
  GeoPoint,
} from "@/lib/agent/types";
import { CURRENT_USER, createIssue, recordComplaint } from "@/lib/db/store";
import type { Complaint } from "@/lib/types";

/**
 * POST /api/agent/submit — the complaint agent, in two phases.
 *
 *   { phase: "prepare", analysis, location, imageUrl, description? }
 *     -> finds the authority and writes the draft, then stops.
 *
 *   { phase: "submit", draft, analysis, location, imageUrl, description? }
 *     -> only reached after the citizen approves the draft on screen.
 *
 * The split is the §9 guarantee: nothing is sent without explicit confirmation.
 */

interface PrepareBody {
  phase: "prepare";
  analysis: IssueAnalysis;
  location: GeoPoint;
  imageUrl: string;
  description?: string;
}

interface SubmitBody {
  phase: "submit";
  draft: ComplaintDraft;
  /** The authority the prepare phase resolved, carried through so the stored
   *  complaint keeps the real department rather than a guess from the address. */
  authority: Authority;
  analysis: IssueAnalysis;
  location: GeoPoint;
  imageUrl: string;
  description?: string;
}

type Body = PrepareBody | SubmitBody;

export async function POST(request: Request) {
  let body: Body;

  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ error: "Send a JSON body." }, { status: 400 });
  }

  if (body?.phase === "prepare") {
    return agentStream(async (emit, signal) => {
      const authority = await complaintAgent.findAuthority(
        body.analysis,
        body.location,
        emit,
        signal,
      );

      const draft = await complaintAgent.draftComplaint(
        {
          analysis: body.analysis,
          authority,
          location: body.location,
          imageUrl: body.imageUrl,
          description: body.description,
          reporterName: CURRENT_USER.name,
        },
        emit,
        signal,
      );

      return { authority, draft };
    }, request.signal);
  }

  if (body?.phase === "submit") {
    return agentStream(async (emit, signal) => {
      const result = await complaintAgent.submitComplaint(
        body.draft,
        emit,
        signal,
      );

      // The issue becomes part of the community feed only once it has been
      // acted on, so the feed never fills with abandoned drafts.
      const issue = createIssue({
        authorId: CURRENT_USER.id,
        authorName: CURRENT_USER.name,
        imageUrl: body.imageUrl,
        description: body.description,
        location: body.location,
        analysis: body.analysis,
        complaintId: result.complaintId,
        complaintStatus: result.status,
      });

      const complaint: Complaint = {
        id: result.complaintId,
        issueId: issue.id,
        authority: body.authority,
        to: body.draft.to,
        subject: body.draft.subject,
        body: body.draft.body,
        attachments: body.draft.attachments,
        status: result.status,
        submittedAt: result.submittedAt,
        channel: result.channel,
        receipt: result.receipt,
        timeline: [
          { at: result.submittedAt, label: "Complaint submitted", note: body.draft.to },
          { at: result.submittedAt, label: "Awaiting acknowledgement" },
        ],
      };

      recordComplaint(complaint);

      return { ...result, issueId: issue.id };
    }, request.signal);
  }

  return Response.json(
    { error: 'Set "phase" to "prepare" or "submit".' },
    { status: 400 },
  );
}
