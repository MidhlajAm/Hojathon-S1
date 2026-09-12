/**
 * Domain types shared by the UI, the API routes and the agent seam.
 *
 * Agent-facing contract types live in `lib/agent/types.ts`. This file is the
 * data the platform stores; that file is what the two agents must satisfy.
 */

import type { Authority, IssueAnalysis, Severity } from "./agent/types";

export type { Severity };

export interface GeoPoint {
  lat: number;
  lng: number;
  /** Human-readable place, e.g. "Near ABC College". */
  label?: string;
}

export type ComplaintStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "in_progress"
  | "resolved"
  | "rejected";

export interface User {
  id: string;
  name: string;
  city: string;
  avatarColor: string;
}

export interface Comment {
  id: string;
  author: string;
  body: string;
  createdAt: string;
}

export interface Issue {
  id: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  imageUrl: string;
  description?: string;
  location: GeoPoint;
  analysis: IssueAnalysis;
  upvotes: number;
  /** Ids of users who have upvoted; keeps the toggle honest in the mock store. */
  upvotedBy: string[];
  comments: Comment[];
  complaintId?: string;
  complaintStatus?: ComplaintStatus;
  /** Other issue ids the analysis agent flagged as the same real-world problem. */
  duplicateOf?: string;
  supporterCount?: number;
}

export interface Complaint {
  id: string;
  issueId: string;
  authority: Authority;
  to: string;
  subject: string;
  body: string;
  attachments: { name: string; url: string }[];
  status: ComplaintStatus;
  submittedAt: string;
  channel: "email" | "portal" | "simulated";
  receipt?: string;
  timeline: { at: string; label: string; note?: string }[];
}

export interface CivicEvent {
  id: string;
  title: string;
  kind: "cleanup" | "grievance" | "environment" | "awareness" | "other";
  startsAt: string;
  venue: string;
  location: GeoPoint;
  summary: string;
  organiser: string;
  /** Set when the agent surfaced this event because of an issue the user reported. */
  recommendedFor?: { issueId: string; reason: string };
}

export type FeedFilter = "nearby" | "trending" | "recent" | "unresolved";
