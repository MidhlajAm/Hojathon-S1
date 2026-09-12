import { getComplaint, getIssue } from "@/lib/db/store";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/issues/[id]">,
) {
  // params is a Promise in Next 16 — synchronous access was removed.
  const { id } = await context.params;
  const issue = getIssue(id);

  if (!issue) {
    return Response.json({ error: "No such issue." }, { status: 404 });
  }

  const complaint = issue.complaintId ? getComplaint(issue.complaintId) : undefined;
  return Response.json({ issue, complaint: complaint ?? null });
}
