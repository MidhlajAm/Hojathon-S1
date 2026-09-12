import { CURRENT_USER, toggleUpvote } from "@/lib/db/store";

export async function POST(
  _request: Request,
  context: RouteContext<"/api/issues/[id]/vote">,
) {
  const { id } = await context.params;
  const issue = toggleUpvote(id, CURRENT_USER.id);

  if (!issue) {
    return Response.json({ error: "No such issue." }, { status: 404 });
  }

  return Response.json({
    upvotes: issue.upvotes,
    upvoted: issue.upvotedBy.includes(CURRENT_USER.id),
  });
}
