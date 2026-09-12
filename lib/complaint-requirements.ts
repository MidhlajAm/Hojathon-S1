import type { AuthorityIssue, AuthorityRecord } from "@/lib/authority";

export type ComplaintRequirementKey =
  | "issue_description"
  | "location"
  | "severity"
  | "supporting_image"
  | "issue_type"
  | "reporter_contact"
  | "nearby_landmark"
  | "safety_impact"
  | "incident_time";

export interface ComplaintRequirement {
  key: ComplaintRequirementKey;
  label: string;
  required: boolean;
  description: string;
}

export interface ComplaintRequirements {
  authorityId?: string;
  authorityName?: string;
  department?: string;
  issueCategory: string;
  issueType?: string;
  requirements: ComplaintRequirement[];
}

const BASE_REQUIREMENTS: readonly ComplaintRequirement[] = [
  {
    key: "issue_type",
    label: "Issue type",
    required: true,
    description: "The normalized civic issue classification.",
  },
  {
    key: "issue_description",
    label: "Issue description",
    required: true,
    description: "A factual short and detailed description of what is happening.",
  },
  {
    key: "location",
    label: "Location",
    required: true,
    description: "Coordinates plus a human-readable address, landmark, or locality.",
  },
  {
    key: "severity",
    label: "Severity",
    required: true,
    description: "The assessed urgency and public impact of the issue.",
  },
  {
    key: "supporting_image",
    label: "Supporting image",
    required: true,
    description: "The uploaded issue image or a stable image URL.",
  },
];

const OPTIONAL_REQUIREMENTS: readonly ComplaintRequirement[] = [
  {
    key: "nearby_landmark",
    label: "Nearby landmark",
    required: false,
    description: "A recognizable landmark that helps the authority find the issue.",
  },
  {
    key: "safety_impact",
    label: "Safety or public impact",
    required: false,
    description: "Any injury risk, obstruction, flooding, access problem, or service impact.",
  },
  {
    key: "incident_time",
    label: "Incident time",
    required: false,
    description: "When the issue was observed or how long it has been present.",
  },
  {
    key: "reporter_contact",
    label: "Reporter contact",
    required: false,
    description: "A reply-to name and contact address when acknowledgement is needed.",
  },
];

const ISSUE_SPECIFIC_REQUIREMENTS: Partial<Record<string, ComplaintRequirement[]>> = {
  pothole_road_damage: [
    {
      key: "safety_impact",
      label: "Traffic or safety impact",
      required: true,
      description: "Whether the damage affects vehicles, pedestrians, or road access.",
    },
  ],
  garbage: [
    {
      key: "incident_time",
      label: "Collection delay",
      required: false,
      description: "How long the waste has remained uncollected.",
    },
  ],
  broken_streetlight: [
    {
      key: "safety_impact",
      label: "Night-time safety impact",
      required: true,
      description: "Whether the unlit area creates a visibility or safety hazard.",
    },
  ],
  water_leakage: [
    {
      key: "incident_time",
      label: "Leak duration",
      required: false,
      description: "How long the leak has been observed and whether it is worsening.",
    },
  ],
  fallen_tree: [
    {
      key: "safety_impact",
      label: "Blocked access or hazard",
      required: true,
      description: "Whether the tree blocks a road, footpath, building, or utility line.",
    },
  ],
  damaged_public_property: [
    {
      key: "safety_impact",
      label: "Public access impact",
      required: false,
      description: "Whether the damaged property prevents safe or normal public use.",
    },
  ],
};

function mergeRequirements(issueType?: string): ComplaintRequirement[] {
  const merged = new Map<ComplaintRequirementKey, ComplaintRequirement>();
  for (const requirement of [...BASE_REQUIREMENTS, ...OPTIONAL_REQUIREMENTS]) {
    merged.set(requirement.key, requirement);
  }
  for (const requirement of ISSUE_SPECIFIC_REQUIREMENTS[issueType ?? ""] ?? []) {
    const existing = merged.get(requirement.key);
    merged.set(requirement.key, existing ? { ...existing, ...requirement } : requirement);
  }
  return [...merged.values()];
}

export function getComplaintRequirements(
  authority: Pick<AuthorityRecord, "id" | "name" | "department"> | undefined,
  issue: AuthorityIssue,
): ComplaintRequirements {
  return {
    authorityId: authority?.id,
    authorityName: authority?.name,
    department: authority?.department,
    issueCategory: issue.category,
    issueType: issue.issueType,
    requirements: mergeRequirements(issue.issueType),
  };
}