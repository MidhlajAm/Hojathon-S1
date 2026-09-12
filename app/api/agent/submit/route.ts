import { runComplaintWorkflow } from "@/lib/complaint-workflow";

interface WorkflowBody {
  imageUrl: string;
  imageMimeType?: string;
  location: { lat: number; lng: number; label?: string };
  description?: string;
  reporterName?: string;
  idempotencyKey?: string;
}

export async function POST(request: Request) {
  let body: WorkflowBody;

  try {
    body = (await request.json()) as WorkflowBody;
  } catch {
    return Response.json({ error: "Send a JSON body." }, { status: 400 });
  }

  if (!body?.imageUrl || !body.location) {
    return Response.json({ error: "imageUrl and location are required." }, { status: 400 });
  }

  const result = await runComplaintWorkflow({
    imageUrl: body.imageUrl,
    imageMimeType: body.imageMimeType ?? "image/jpeg",
    location: body.location,
    description: body.description,
    reporterName: body.reporterName,
    idempotencyKey: body.idempotencyKey,
  });
  return Response.json(result, {
    status: result.status === "failed" ? 422 : 200,
  });
}
