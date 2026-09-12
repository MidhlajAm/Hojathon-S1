import { listComplaints } from "@/lib/db/store";

export async function GET() {
  return Response.json({ complaints: listComplaints() });
}
