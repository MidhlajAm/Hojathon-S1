import { analyzeIssue } from "@/lib/agent/analyze";
import { agentStream } from "@/lib/agent/stream";
import type { AnalyzeInput } from "@/lib/agent/types";

/**
 * POST /api/agent/analyze — streams the analysis agent's progress.
 *
 * Body: { imageUrl, description?, location? }
 * Frames: `event: step` per emitted step, then one `event: result` with
 * { analysis, duplicates? }, or `event: error` if the agent threw.
 */
export async function POST(request: Request) {
  let input: AnalyzeInput;

  try {
    input = (await request.json()) as AnalyzeInput;
  } catch {
    return Response.json({ error: "Send a JSON body." }, { status: 400 });
  }

  if (!input?.imageUrl) {
    return Response.json(
      { error: "A photo is required before the agent can analyse the issue." },
      { status: 400 },
    );
  }

  return agentStream(
    (emit, signal) => analyzeIssue(input, emit, signal),
    request.signal,
  );
}
