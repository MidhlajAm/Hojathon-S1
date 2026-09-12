import { listEvents } from "@/lib/db/store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));
  const near =
    Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : undefined;

  return Response.json({ events: listEvents(near) });
}
