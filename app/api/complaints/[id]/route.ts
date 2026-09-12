import { getComplaint, getIssue } from "@/lib/db/store";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/complaints/[id]">,
) {
  const { id } = await context.params;
  const complaint = getComplaint(id);

  if (!complaint) {
    return Response.json({ error: "No such complaint." }, { status: 404 });
  }

  return Response.json({
    complaint,
    issue: getIssue(complaint.issueId) ?? null,
  });
}
