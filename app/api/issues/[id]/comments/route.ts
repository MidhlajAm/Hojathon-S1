import { CURRENT_USER, addComment } from "@/lib/db/store";

export async function POST(
  request: Request,
  context: RouteContext<"/api/issues/[id]/comments">,
) {
  const { id } = await context.params;
  const body = await request.json();
  const text = String(body?.body ?? "").trim();

  if (!text) {
    return Response.json({ error: "Write something first." }, { status: 400 });
  }

  const issue = addComment(id, { author: CURRENT_USER.name, body: text });

  if (!issue) {
    return Response.json({ error: "No such issue." }, { status: 404 });
  }

  return Response.json({ comments: issue.comments }, { status: 201 });
}
