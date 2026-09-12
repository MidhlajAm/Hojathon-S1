import { distanceKm } from "../geo";
import type {
  CivicEvent,
  Comment,
  Complaint,
  ComplaintStatus,
  FeedFilter,
  GeoPoint,
  Issue,
} from "../types";
import { CURRENT_USER, seedComplaints, seedEvents, seedIssues } from "./seed";

/**
 * In-memory store.
 *
 * Everything the app reads or writes goes through this module, so swapping in
 * MongoDB means implementing the same functions in `lib/db/mongo.ts` and
 * re-exporting from here. Nothing else in the app touches storage.
 *
 * State is held on `globalThis` so it survives the module reloads that Turbopack
 * performs during development.
 */

interface Database {
  issues: Issue[];
  complaints: Complaint[];
  events: CivicEvent[];
}

const GLOBAL_KEY = Symbol.for("civicconnect.db");

function createDatabase(): Database {
  const issues = seedIssues();
  return { issues, complaints: seedComplaints(issues), events: seedEvents() };
}

function db(): Database {
  const container = globalThis as unknown as Record<symbol, Database | undefined>;
  container[GLOBAL_KEY] ??= createDatabase();
  return container[GLOBAL_KEY];
}

export { CURRENT_USER };

/* ------------------------------------------------------------------ issues */

export interface ListIssuesOptions {
  filter?: FeedFilter;
  near?: GeoPoint;
  authorId?: string;
  status?: ComplaintStatus | "all";
  query?: string;
}

const UNRESOLVED: ComplaintStatus[] = [
  "draft",
  "submitted",
  "under_review",
  "in_progress",
];

export function listIssues(options: ListIssuesOptions = {}): Issue[] {
  const { filter = "recent", near, authorId, status, query } = options;
  let issues = [...db().issues];

  if (authorId) {
    issues = issues.filter((issue) => issue.authorId === authorId);
  }

  if (status && status !== "all") {
    issues = issues.filter((issue) => issue.complaintStatus === status);
  }

  if (query) {
    const needle = query.toLowerCase();
    issues = issues.filter((issue) =>
      [issue.analysis.title, issue.analysis.category, issue.location.label ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }

  switch (filter) {
    case "nearby":
      if (near) {
        issues.sort(
          (a, b) => distanceKm(near, a.location) - distanceKm(near, b.location),
        );
      }
      break;
    case "trending":
      issues.sort((a, b) => b.upvotes - a.upvotes);
      break;
    case "unresolved":
      issues = issues.filter(
        (issue) =>
          !issue.complaintStatus || UNRESOLVED.includes(issue.complaintStatus),
      );
      issues.sort(
        (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
      );
      break;
    default:
      issues.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }

  return issues;
}

export function getIssue(id: string): Issue | undefined {
  return db().issues.find((issue) => issue.id === id);
}

export function createIssue(
  issue: Omit<Issue, "id" | "createdAt" | "upvotes" | "upvotedBy" | "comments">,
): Issue {
  const created: Issue = {
    ...issue,
    id: `iss-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    upvotes: 0,
    upvotedBy: [],
    comments: [],
  };
  db().issues.unshift(created);
  return created;
}

export function toggleUpvote(id: string, userId: string): Issue | undefined {
  const issue = getIssue(id);
  if (!issue) return undefined;

  const index = issue.upvotedBy.indexOf(userId);
  if (index === -1) {
    issue.upvotedBy.push(userId);
    issue.upvotes += 1;
  } else {
    issue.upvotedBy.splice(index, 1);
    issue.upvotes = Math.max(0, issue.upvotes - 1);
  }
  return issue;
}

export function addComment(
  id: string,
  comment: Omit<Comment, "id" | "createdAt">,
): Issue | undefined {
  const issue = getIssue(id);
  if (!issue) return undefined;

  issue.comments.push({
    ...comment,
    id: `c-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  });
  return issue;
}

/* -------------------------------------------------------------- complaints */

export function listComplaints(issueIds?: string[]): Complaint[] {
  const complaints = db().complaints;
  if (!issueIds) return [...complaints];
  return complaints.filter((complaint) => issueIds.includes(complaint.issueId));
}

/**
 * CIV-2026-1043 — the next free tracking id.
 *
 * Derived from the ids already stored rather than a module counter, so it stays
 * correct however the server bundles or reloads this module. MongoDB takes this
 * over with its own sequence later.
 */
export function allocateComplaintId(now: Date = new Date()): string {
  const highest = db().complaints.reduce((max, complaint) => {
    const suffix = Number(complaint.id.split("-").pop());
    return Number.isFinite(suffix) ? Math.max(max, suffix) : max;
  }, 1041);

  return `CIV-${now.getFullYear()}-${String(highest + 1).padStart(4, "0")}`;
}

export function getComplaint(id: string): Complaint | undefined {
  return db().complaints.find((complaint) => complaint.id === id);
}

export function recordComplaint(complaint: Complaint): Complaint {
  // Tracking ids are how a citizen refers to their complaint, so a collision is
  // a data error rather than something to render twice.
  if (getComplaint(complaint.id)) {
    throw new Error(`Complaint ${complaint.id} already exists.`);
  }

  db().complaints.unshift(complaint);

  const issue = getIssue(complaint.issueId);
  if (issue) {
    issue.complaintId = complaint.id;
    issue.complaintStatus = complaint.status;
  }
  return complaint;
}

/* ------------------------------------------------------------------ events */

export function listEvents(near?: GeoPoint): CivicEvent[] {
  const events = [...db().events];
  if (near) {
    events.sort(
      (a, b) => distanceKm(near, a.location) - distanceKm(near, b.location),
    );
  } else {
    events.sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  }
  return events;
}

/* ------------------------------------------------------------------ counts */

export function profileStats(userId: string) {
  const issues = db().issues;
  const mine = issues.filter((issue) => issue.authorId === userId);

  return {
    reported: mine.length,
    supported: issues.filter((issue) => issue.upvotedBy.includes(userId)).length,
    resolved: mine.filter((issue) => issue.complaintStatus === "resolved").length,
    comments: issues.reduce(
      (total, issue) =>
        total +
        issue.comments.filter((comment) => comment.author === CURRENT_USER.name)
          .length,
      0,
    ),
  };
}
