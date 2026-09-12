import { CURRENT_USER, createIssue, listIssues } from "@/lib/db/store";
import type { FeedFilter } from "@/lib/types";

const FILTERS: FeedFilter[] = ["nearby", "trending", "recent", "unresolved"];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = url.searchParams.get("filter");
  const filter = FILTERS.includes(raw as FeedFilter)
    ? (raw as FeedFilter)
    : "recent";

  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));
  const near =
    Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : undefined;

  const issues = listIssues({
    filter,
    near,
    query: url.searchParams.get("q") ?? undefined,
    authorId: url.searchParams.get("author") ?? undefined,
  });

  return Response.json({ issues });
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body?.imageUrl || !body?.analysis || !body?.location) {
    return Response.json(
      { error: "An issue needs a photo, an analysis and a location." },
      { status: 400 },
    );
  }

  const issue = createIssue({
    authorId: CURRENT_USER.id,
    authorName: CURRENT_USER.name,
    imageUrl: body.imageUrl,
    description: body.description,
    location: body.location,
    analysis: body.analysis,
  });

  return Response.json({ issue }, { status: 201 });
}
