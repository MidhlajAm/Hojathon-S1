/**
 * MongoDB swap-in.
 *
 * `lib/db/store.ts` is the only storage module the app imports. To move off the
 * in-memory store, implement the same exported functions here against MongoDB
 * and re-export them from `store.ts`. No page, component or route changes.
 *
 *   npm install mongodb
 *
 *   const client = new MongoClient(process.env.MONGODB_URI!)
 *   export async function listIssues(...) { ... }
 *
 * Note that the store's functions are currently synchronous. Making them async
 * is a one-line change at each call site (they are all already inside `async`
 * route handlers and server components), so prefer async signatures here.
 *
 * Collections: `issues`, `complaints`, `events`, keyed by the `id` field rather
 * than `_id` so the seeded ids keep working.
 */

export function mongoAvailable(): boolean {
  return (process.env.MONGODB_URI ?? "").length > 0;
}
