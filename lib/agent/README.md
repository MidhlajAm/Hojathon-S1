# The agent seam

Everything the frontend knows about the agents is in `types.ts`. Implement against
that and no UI code needs to change.

| Agent | File | Implements |
| --- | --- | --- |
| Issue analysis | `analyze.ts` | `analyzeIssue: AnalyzeAgent` |
| Authority + complaint | `submit.ts` | `complaintAgent: ComplaintAgent` |

Both files currently hold mocks that emit realistic steps on a timer. Replace the
bodies; keep the signatures.

## Emitting progress

Every method receives `emit(step)`. Each call is streamed to the browser
immediately over SSE and drawn on the agent timeline, so the citizen watches the
work happen rather than a loading spinner.

```ts
emit({ id: "authority", label: "Finding who is responsible", status: "active" });
const authority = await resolve(analysis, location);
emit({
  id: "authority",                       // same id updates the line in place
  label: "Responsible authority identified",
  status: "done",
  detail: `${authority.name} — ${authority.jurisdiction}`,
});
```

Statuses are `pending | active | done | failed`. Emit `active` when you start a
step and re-emit the same `id` as `done` when it finishes, with the value you
found in `detail`.

## Failing

Throw. `agentStream` in `stream.ts` converts a throw into a failed step plus an
`error` frame, and the UI offers a retry. Do not catch an error and return a
plausible-looking result — a wrong analysis presented confidently is worse than a
visible failure.

Honour the `AbortSignal`; the citizen can navigate away mid-run.

## Autonomous workflow

The workflow runs analysis, authority selection, verified email lookup,
requirements, complaint generation, email submission, and persistence as one
operation. It must return a visible failure when an official email is missing
or delivery fails; it must never invent an authority contact.

## Testing without the UI

```bash
curl -N -X POST localhost:3000/api/agent/analyze \
  -H 'content-type: application/json' \
  -d '{"imageUrl":"/seed/pothole.jpg","description":"deep pothole","location":{"lat":9.98,"lng":76.29,"label":"Near ABC College"}}'
```

You should see `event: step` frames arriving one at a time, then a single
`event: result`. The same works for `/api/agent/submit` with
`{"phase":"prepare"}` or `{"phase":"submit"}` in the body.

## Services

`lib/gemini.ts` and `lib/cloudinary.ts` are adapters — each returns a real client
when its environment variable is set and a mock otherwise, so the app runs with an
empty `.env.local`. Add keys to `.env.local`:

```
GEMINI_API_KEY=
MONGODB_URI=
CLOUDINARY_URL=
```
