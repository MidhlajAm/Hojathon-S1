import { authorityForCategory } from "../agent/submit";
import type { CivicEvent, Complaint, Issue, User } from "../types";

/** The signed-in citizen. Auth is out of scope for the MVP. */
export const CURRENT_USER: User = {
  id: "u-rahul",
  name: "Rahul",
  city: "Kochi",
  avatarColor: "#0b5fd0",
};

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

function daysAgo(days: number): string {
  return minutesAgo(days * 24 * 60);
}

export function seedIssues(): Issue[] {
  return [
    {
      id: "iss-1042",
      authorId: "u-rahul",
      authorName: "Rahul",
      createdAt: minutesAgo(12),
      imageUrl: "/seed/pothole.svg",
      description: "Two bikes went down here this week.",
      location: { lat: 9.9881, lng: 76.3041, label: "Near ABC College" },
      analysis: {
        isCivicIssue: true,
        title: "Severe pothole",
        category: "road",
        summary:
          "Large road damage across the carriageway, deep enough to throw a two-wheeler off line. Standing water suggests it has been widening for some weeks.",
        severity: "high",
        confidence: 0.91,
        tags: ["pothole", "road damage", "two-wheeler hazard"],
      },
      upvotes: 124,
      upvotedBy: [],
      comments: [
        {
          id: "c-1",
          author: "Meera",
          body: "It floods completely in the rain. You cannot see how deep it is.",
          createdAt: minutesAgo(8),
        },
        {
          id: "c-2",
          author: "Anand",
          body: "Reported this last month from the corner side too.",
          createdAt: minutesAgo(4),
        },
      ],
      complaintId: "CIV-2026-1042",
      complaintStatus: "under_review",
      supporterCount: 24,
    },
    {
      id: "iss-1041",
      authorId: "u-meera",
      authorName: "Meera",
      createdAt: minutesAgo(96),
      imageUrl: "/seed/garbage.svg",
      location: { lat: 9.9742, lng: 76.2865, label: "Panampilly Nagar, 4th cross" },
      analysis: {
        isCivicIssue: true,
        title: "Uncollected waste pile",
        category: "waste",
        summary:
          "Mixed household waste dumped outside the collection point and spreading onto the footpath. Likely a missed collection rather than illegal dumping.",
        severity: "medium",
        confidence: 0.84,
        tags: ["waste", "collection", "public health"],
      },
      upvotes: 58,
      upvotedBy: [],
      comments: [],
      complaintId: "CIV-2026-1039",
      complaintStatus: "in_progress",
    },
    {
      id: "iss-1038",
      authorId: "u-anand",
      authorName: "Anand",
      createdAt: daysAgo(2),
      imageUrl: "/seed/streetlight.svg",
      description: "Whole stretch is dark after 8pm.",
      location: { lat: 9.9925, lng: 76.2812, label: "Main Road, near the bridge" },
      analysis: {
        isCivicIssue: true,
        title: "Streetlight out",
        category: "streetlight",
        summary:
          "Pole-mounted light is dark with no visible damage to the fitting, so the lamp or the feeder circuit has most likely failed.",
        severity: "medium",
        confidence: 0.79,
        tags: ["streetlight", "night safety"],
      },
      upvotes: 41,
      upvotedBy: [],
      comments: [
        {
          id: "c-3",
          author: "Rahul",
          body: "Same on the opposite footpath.",
          createdAt: daysAgo(1),
        },
      ],
      complaintId: "CIV-2026-0991",
      complaintStatus: "resolved",
    },
    {
      id: "iss-1036",
      authorId: "u-fathima",
      authorName: "Fathima",
      createdAt: daysAgo(3),
      imageUrl: "/seed/drain.svg",
      location: { lat: 9.9689, lng: 76.3122, label: "Kadavanthra junction" },
      analysis: {
        isCivicIssue: true,
        title: "Blocked drain",
        category: "drainage",
        summary:
          "Silt and plastic have choked the drain mouth, so runoff is backing up across the road. This floods quickly in heavy rain.",
        severity: "high",
        confidence: 0.88,
        tags: ["drainage", "flooding"],
      },
      upvotes: 96,
      upvotedBy: [],
      comments: [],
      complaintId: "CIV-2026-1015",
      complaintStatus: "submitted",
    },
    {
      id: "iss-1031",
      authorId: "u-joseph",
      authorName: "Joseph",
      createdAt: daysAgo(4),
      imageUrl: "/seed/water.svg",
      description: "Running day and night for a week.",
      location: { lat: 10.0043, lng: 76.3078, label: "Palarivattom, service road" },
      analysis: {
        isCivicIssue: true,
        title: "Pipeline leak",
        category: "water",
        summary:
          "Continuous flow from a buried main is undercutting the road edge. Water loss looks significant and the surface is already subsiding.",
        severity: "critical",
        confidence: 0.93,
        tags: ["water", "leak", "road subsidence"],
      },
      upvotes: 187,
      upvotedBy: [],
      comments: [],
      complaintId: "CIV-2026-1002",
      complaintStatus: "in_progress",
      supporterCount: 31,
    },
    {
      id: "iss-1028",
      authorId: "u-rahul",
      authorName: "Rahul",
      createdAt: daysAgo(6),
      imageUrl: "/seed/pothole.svg",
      location: { lat: 9.9612, lng: 76.2951, label: "Thevara ferry road" },
      analysis: {
        isCivicIssue: true,
        title: "Cracked road surface",
        category: "road",
        summary:
          "Surface cracking along the wheel path with loose aggregate. Not yet a hazard, but it will open into potholes through the monsoon.",
        severity: "low",
        confidence: 0.72,
        tags: ["road damage", "preventive"],
      },
      upvotes: 19,
      upvotedBy: [],
      comments: [],
      complaintId: "CIV-2026-0974",
      complaintStatus: "submitted",
    },
    {
      id: "iss-1022",
      authorId: "u-meera",
      authorName: "Meera",
      createdAt: daysAgo(8),
      imageUrl: "/seed/garbage.svg",
      location: { lat: 9.9788, lng: 76.2743, label: "Behind the market, Ernakulam" },
      analysis: {
        isCivicIssue: true,
        title: "Waste dumped at the canal edge",
        category: "waste",
        summary:
          "Household and shop waste tipped directly onto the canal bank, where it washes into the water on the next high tide.",
        severity: "high",
        confidence: 0.86,
        tags: ["waste", "canal", "water pollution"],
      },
      upvotes: 73,
      upvotedBy: [],
      comments: [],
    },
    {
      id: "iss-1019",
      authorId: "u-anand",
      authorName: "Anand",
      createdAt: daysAgo(11),
      imageUrl: "/seed/streetlight.svg",
      location: { lat: 9.9954, lng: 76.3164, label: "Vyttila hub approach" },
      analysis: {
        isCivicIssue: true,
        title: "Four lights out on one stretch",
        category: "streetlight",
        summary:
          "A run of four consecutive poles is unlit, which points at the feeder rather than individual lamps.",
        severity: "medium",
        confidence: 0.81,
        tags: ["streetlight", "feeder fault"],
      },
      upvotes: 34,
      upvotedBy: [],
      comments: [],
      complaintId: "CIV-2026-0948",
      complaintStatus: "resolved",
    },
  ];
}

export function seedComplaints(issues: Issue[]): Complaint[] {
  const withComplaints = issues.filter((issue) => issue.complaintId);

  return withComplaints.map((issue) => {
    const authority = authorityForCategory(issue.analysis.category);
    const status = issue.complaintStatus ?? "submitted";

    const timeline: Complaint["timeline"] = [
      { at: issue.createdAt, label: "Complaint submitted", note: authority.name },
    ];
    if (status !== "submitted") {
      timeline.push({
        at: issue.createdAt,
        label: "Acknowledged by the department",
      });
    }
    if (status === "in_progress" || status === "resolved") {
      timeline.push({ at: issue.createdAt, label: "Work order raised" });
    }
    if (status === "resolved") {
      timeline.push({ at: issue.createdAt, label: "Marked resolved" });
    }

    return {
      id: issue.complaintId as string,
      issueId: issue.id,
      authority,
      to: authority.email,
      subject: `${issue.analysis.title} at ${issue.location.label ?? "reported location"}`,
      body: `A ${issue.analysis.title.toLowerCase()} has been reported at ${issue.location.label}. ${issue.analysis.summary}`,
      attachments: [{ name: "issue-photo.jpg", url: issue.imageUrl }],
      status,
      submittedAt: issue.createdAt,
      channel: "simulated",
      receipt: "Demo submission — no message left this machine",
      timeline,
    };
  });
}

export function seedEvents(): CivicEvent[] {
  const soon = (days: number) =>
    new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: "evt-1",
      title: "Community clean-up drive",
      kind: "cleanup",
      startsAt: soon(6),
      venue: "Panampilly Nagar, 4th cross",
      location: { lat: 9.9746, lng: 76.2869, label: "Panampilly Nagar" },
      summary:
        "Residents' association clearing the canal bank and the collection point. Gloves and bags provided.",
      organiser: "Panampilly Residents' Association",
      recommendedFor: {
        issueId: "iss-1041",
        reason: "Covers the collection point in the waste report you filed",
      },
    },
    {
      id: "evt-2",
      title: "Public grievance camp",
      kind: "grievance",
      startsAt: soon(8),
      venue: "Municipal Hall",
      location: { lat: 9.9816, lng: 76.2999, label: "Municipal Hall" },
      summary:
        "Officers from roads, water and lighting take complaints in person. Bring your tracking id.",
      organiser: "Kochi Corporation",
    },
    {
      id: "evt-3",
      title: "Monsoon drain readiness walk",
      kind: "environment",
      startsAt: soon(13),
      venue: "Kadavanthra junction",
      location: { lat: 9.9691, lng: 76.3119, label: "Kadavanthra" },
      summary:
        "Walking survey of drain mouths before the rains, mapping blockages ward by ward.",
      organiser: "Ward 42 volunteers",
    },
    {
      id: "evt-4",
      title: "Road safety awareness evening",
      kind: "awareness",
      startsAt: soon(19),
      venue: "ABC College grounds",
      location: { lat: 9.9884, lng: 76.3038, label: "ABC College" },
      summary:
        "Traffic police session on night visibility and two-wheeler safety on damaged roads.",
      organiser: "City Traffic Police",
    },
  ];
}
